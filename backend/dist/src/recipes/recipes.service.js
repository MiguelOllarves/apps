"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const inventory_service_1 = require("../inventory/inventory.service");
const types_1 = require("../shared/types");
let RecipesService = class RecipesService {
    prisma;
    inventory;
    constructor(prisma, inventory) {
        this.prisma = prisma;
        this.inventory = inventory;
    }
    async calculateCost(tenantId, recipeId) {
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
        if (!recipe)
            throw new common_1.NotFoundException('Recipe not found');
        let totalCost = 0;
        for (const ingredient of recipe.ingredients) {
            if (ingredient.rawMaterial) {
                const ingFactor = types_1.UNIT_FACTORS[ingredient.unit] || 1;
                const matFactor = types_1.UNIT_FACTORS[ingredient.rawMaterial.unit] || 1;
                const isIngMassVolume = ['G', 'KG', 'LB', 'OZ', 'ML', 'L', 'OZ_FL', 'GAL'].includes(ingredient.unit);
                const isMatDiscrete = ['UNIT', 'PACK', 'DOZEN', 'BOX'].includes(ingredient.rawMaterial.unit);
                let adjustedMatFactor = matFactor;
                if (isIngMassVolume && isMatDiscrete && matFactor === 1) {
                    adjustedMatFactor = 1000;
                }
                const shrinkageMultiplier = 1 + (ingredient.rawMaterial.shrinkagePercentage / 100);
                const effectiveQtyInMatUnit = ((ingredient.quantity * ingFactor) / adjustedMatFactor) * shrinkageMultiplier;
                totalCost += ingredient.rawMaterial.replacementCost * effectiveQtyInMatUnit;
            }
            else if (ingredient.subRecipe) {
                const subCost = await this.calculateCost(tenantId, ingredient.subRecipe.id);
                totalCost += subCost * ingredient.quantity;
            }
        }
        totalCost = Math.round(totalCost * 100) / 100;
        await this.prisma.recipe.update({
            where: { id: recipeId },
            data: { genericCost: totalCost },
        });
        return totalCost;
    }
    async consumeRecipeIngredients(tenantId, recipeId, multiplier = 1, tx) {
        const client = tx || this.prisma;
        const recipe = await client.recipe.findFirst({
            where: { id: recipeId, tenantId },
            include: { ingredients: { include: { rawMaterial: true, subRecipe: true } } },
        });
        if (!recipe)
            throw new common_1.NotFoundException('Recipe not found');
        for (const ingredient of recipe.ingredients) {
            const consumptionQty = ingredient.quantity * multiplier;
            if (ingredient.rawMaterial) {
                const ingFactor = types_1.UNIT_FACTORS[ingredient.unit] || 1;
                const matFactor = types_1.UNIT_FACTORS[ingredient.rawMaterial.unit] || 1;
                const shrinkageMultiplier = 1 + (ingredient.rawMaterial.shrinkagePercentage / 100);
                const effectiveQtyInMatUnit = ((consumptionQty * ingFactor) / matFactor) * shrinkageMultiplier;
                await this.inventory.recordTransaction(tenantId, {
                    rawMaterialId: ingredient.rawMaterial.id,
                    type: 'SALE',
                    quantityChanged: -effectiveQtyInMatUnit,
                    referenceId: 'order-item-' + recipeId,
                }, client);
            }
            else if (ingredient.subRecipe) {
                await this.consumeRecipeIngredients(tenantId, ingredient.subRecipe.id, consumptionQty, tx);
            }
        }
    }
    async findAll(tenantId) {
        return this.prisma.recipe.findMany({
            where: { tenantId },
            include: {
                ingredients: { include: { rawMaterial: true, subRecipe: true } },
                menuItem: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(tenantId, id) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id, tenantId },
            include: { ingredients: { include: { rawMaterial: true, subRecipe: true } } },
        });
        if (!recipe)
            throw new common_1.NotFoundException('Recipe not found');
        return recipe;
    }
    async create(tenantId, data) {
        const { name, price, ingredients, categoryId: inputCategoryId, currencyId: inputCurrencyId, imageUrl } = data;
        let categoryId = inputCategoryId;
        let currencyId = inputCurrencyId;
        const recipe = await this.prisma.$transaction(async (tx) => {
            if (!categoryId) {
                const cat = (await tx.category.findFirst({ where: { tenantId, type: 'MENU_ITEM' } })) ||
                    (await tx.category.create({ data: { tenantId, name: 'Platos Principales', type: 'MENU_ITEM' } }));
                categoryId = cat.id;
            }
            if (!currencyId) {
                const cur = (await tx.currency.findFirst({ where: { tenantId, code: 'USD' } })) ||
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
                    data: ingredients.map((ing) => ({
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
                        categoryId: categoryId,
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
    async update(tenantId, id, data) {
        const { name, price, ingredients, categoryId, currencyId, imageUrl, description } = data;
        const recipe = await this.prisma.$transaction(async (tx) => {
            const updatedRecipe = await tx.recipe.update({
                where: { id, tenantId },
                data: {
                    name: name,
                    description: description,
                    imageUrl: imageUrl,
                },
            });
            if (ingredients) {
                await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
                await tx.recipeIngredient.createMany({
                    data: ingredients.map((ing) => ({
                        recipeId: id,
                        rawMaterialId: ing.rawMaterialId,
                        quantity: ing.quantity,
                        unit: ing.unit,
                    })),
                });
            }
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
    async remove(tenantId, id) {
        return this.prisma.$transaction(async (tx) => {
            await tx.menuItem.deleteMany({ where: { recipeId: id } });
            await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
            return tx.recipe.delete({
                where: { id, tenantId },
            });
        });
    }
};
exports.RecipesService = RecipesService;
exports.RecipesService = RecipesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], RecipesService);
//# sourceMappingURL=recipes.service.js.map