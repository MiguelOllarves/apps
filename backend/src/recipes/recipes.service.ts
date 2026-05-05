import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { Prisma } from '@prisma/client';
import { CreateRecipeDto, RecipeIngredientDto } from './dto/recipes.dto';
import { UNIT_FACTORS } from '../shared/types';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService,
  ) { }

  async calculateCost(tenantId: string, recipeId: string): Promise<number> {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, tenantId },
      include: {
        ingredients: {
          include: {
            rawMaterial: true,
            subRecipe: true,
          },
        },
      },
    });

    if (!recipe) throw new NotFoundException('Recipe not found');

    let totalCost = 0;
    for (const ingredient of recipe.ingredients) {
      if (ingredient.rawMaterial) {
        const ingFactor = UNIT_FACTORS[ingredient.unit] || 1;
        const matFactor = UNIT_FACTORS[ingredient.rawMaterial.unit] || 1;

        // Heurística de Seguridad: Si el insumo está en UNIDADES pero la receta usa GRAMOS/ML,
        // asumimos que 1 UNIDAD = 1000g/ml (ej: un saco de 1kg).
        // Esto evita que 100g de arroz se cobren como 100 sacos si el insumo no se puso en KG.
        const isIngMassVolume = ['G', 'KG', 'LB', 'OZ', 'ML', 'L', 'OZ_FL', 'GAL'].includes(ingredient.unit);
        const isMatDiscrete = ['UNIT', 'PACK', 'DOZEN', 'BOX'].includes(ingredient.rawMaterial.unit);

        let adjustedMatFactor = matFactor;
        if (isIngMassVolume && isMatDiscrete && matFactor === 1) {
          adjustedMatFactor = 1000;
        }

        const shrinkageMultiplier = 1 + (ingredient.rawMaterial.shrinkagePercentage / 100);
        const effectiveQtyInMatUnit = ((ingredient.quantity * ingFactor) / adjustedMatFactor) * shrinkageMultiplier;

        totalCost += ingredient.rawMaterial.replacementCost * effectiveQtyInMatUnit;
      } else if (ingredient.subRecipe) {
        const subCost = await this.calculateCost(tenantId, ingredient.subRecipe.id);
        totalCost += subCost * ingredient.quantity;
      }
    }

    // Round to 2 decimal places to prevent floating-point drift
    totalCost = Math.round(totalCost * 100) / 100;

    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { genericCost: totalCost },
    });

    return totalCost;
  }

  async consumeRecipeIngredients(
    tenantId: string,
    recipeId: string,
    multiplier: number = 1,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this.prisma;
    const recipe = await client.recipe.findFirst({
      where: { id: recipeId, tenantId },
      include: { ingredients: { include: { rawMaterial: true, subRecipe: true } } },
    });

    if (!recipe) throw new NotFoundException('Recipe not found');

    for (const ingredient of recipe.ingredients) {
      const consumptionQty = ingredient.quantity * multiplier;

      if (ingredient.rawMaterial) {
        const ingFactor = UNIT_FACTORS[ingredient.unit] || 1;
        const matFactor = UNIT_FACTORS[ingredient.rawMaterial.unit] || 1;

        // DEDUCCIÓN ATÓMICA CON MERMA
        const shrinkageMultiplier = 1 + (ingredient.rawMaterial.shrinkagePercentage / 100);
        const effectiveQtyInMatUnit = ((consumptionQty * ingFactor) / matFactor) * shrinkageMultiplier;

        await this.inventory.recordTransaction(
          tenantId,
          {
            rawMaterialId: ingredient.rawMaterial.id,
            type: 'SALE',
            quantityChanged: -effectiveQtyInMatUnit,
            referenceId: 'order-item-' + recipeId,
          },
          client as Prisma.TransactionClient,
        );
      } else if (ingredient.subRecipe) {
        await this.consumeRecipeIngredients(tenantId, ingredient.subRecipe.id, consumptionQty, tx);
      }
    }
  }

  async findAll(tenantId: string) {
    return this.prisma.recipe.findMany({
      where: { tenantId },
      include: {
        ingredients: { include: { rawMaterial: true, subRecipe: true } },
        menuItem: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, tenantId },
      include: { ingredients: { include: { rawMaterial: true, subRecipe: true } } },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  async create(tenantId: string, data: CreateRecipeDto) {
    const { name, price, ingredients, categoryId: inputCategoryId, currencyId: inputCurrencyId, imageUrl } = data;

    let categoryId = inputCategoryId;
    let currencyId = inputCurrencyId;

    const recipe = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (!categoryId) {
        const cat =
          (await tx.category.findFirst({ where: { tenantId, type: 'MENU_ITEM' } })) ||
          (await tx.category.create({ data: { tenantId, name: 'Platos Principales', type: 'MENU_ITEM' } }));
        categoryId = cat.id;
      }
      if (!currencyId) {
        const cur =
          (await tx.currency.findFirst({ where: { tenantId, code: 'USD' } })) ||
          (await tx.currency.findFirst({ where: { tenantId } }));
        currencyId = cur?.id;
      }

      const newRecipe = await tx.recipe.create({
        data: {
          tenantId,
          name,
          type: 'FINAL_PRODUCT',
          imageUrl: imageUrl,
        },
      });

      if (ingredients && ingredients.length > 0) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((ing: RecipeIngredientDto) => ({
            recipeId: newRecipe.id,
            rawMaterialId: ing.rawMaterialId,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        });
      }

      if (currencyId) {
        await tx.menuItem.create({
          data: {
            tenantId,
            recipeId: newRecipe.id,
            categoryId: categoryId!,
            price,
            currencyId,
          },
        });
      }

      return newRecipe;
    });

    await this.calculateCost(tenantId, recipe.id);
    return recipe;
  }

  async update(tenantId: string, id: string, data: Partial<CreateRecipeDto>) {
    const { name, price, ingredients, categoryId, currencyId, imageUrl } = data;

    const recipe = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update Recipe basic info
      const updatedRecipe = await tx.recipe.update({
        where: { id, tenantId },
        data: {
          name: name,
          imageUrl: imageUrl,
        },
      });

      // 2. Update Ingredients (Delete and Re-create for simplicity in this case)
      if (ingredients) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
        await tx.recipeIngredient.createMany({
          data: ingredients.map((ing: RecipeIngredientDto) => ({
            recipeId: id,
            rawMaterialId: ing.rawMaterialId,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        });
      }

      // 3. Update MenuItem (Price and Category)
      if (price !== undefined || categoryId || currencyId) {
        await tx.menuItem.update({
          where: { recipeId: id },
          data: {
            price: price,
            categoryId: categoryId,
            currencyId: currencyId,
          },
        });
      }

      return updatedRecipe;
    });

    await this.calculateCost(tenantId, id);
    return recipe;
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete associations first due to FK constraints if not Cascade
      await tx.menuItem.deleteMany({ where: { recipeId: id } });
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      return tx.recipe.delete({
        where: { id, tenantId },
      });
    });
  }
}
