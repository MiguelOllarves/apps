import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { Prisma } from '@prisma/client';
import { CreateRecipeDto } from './dto/recipes.dto';
export declare class RecipesService {
    private prisma;
    private inventory;
    constructor(prisma: PrismaService, inventory: InventoryService);
    calculateCost(tenantId: string, recipeId: string): Promise<number>;
    consumeRecipeIngredients(tenantId: string, recipeId: string, multiplier?: number, tx?: Prisma.TransactionClient): Promise<void>;
    findAll(tenantId: string): Promise<({
        menuItem: {
            id: string;
            categoryId: string;
            tenantId: string;
            price: number;
            currencyId: string;
            recipeId: string;
            isAvailable: boolean;
        } | null;
        ingredients: ({
            rawMaterial: {
                id: string;
                name: string;
                unit: import("@prisma/client").$Enums.UnitType;
                currentStock: number;
                minStockAlert: number;
                baseCost: number;
                replacementCost: number;
                yieldPercentage: number;
                shrinkagePercentage: number;
                categoryId: string;
                updatedAt: Date;
                tenantId: string;
            } | null;
            subRecipe: {
                id: string;
                name: string;
                tenantId: string;
                type: import("@prisma/client").$Enums.RecipeType;
                imageUrl: string | null;
                description: string | null;
                genericCost: number;
                nutritionalInfo: string | null;
            } | null;
        } & {
            id: string;
            unit: string;
            rawMaterialId: string | null;
            quantity: number;
            recipeId: string;
            subRecipeId: string | null;
        })[];
    } & {
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.RecipeType;
        imageUrl: string | null;
        description: string | null;
        genericCost: number;
        nutritionalInfo: string | null;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        ingredients: ({
            rawMaterial: {
                id: string;
                name: string;
                unit: import("@prisma/client").$Enums.UnitType;
                currentStock: number;
                minStockAlert: number;
                baseCost: number;
                replacementCost: number;
                yieldPercentage: number;
                shrinkagePercentage: number;
                categoryId: string;
                updatedAt: Date;
                tenantId: string;
            } | null;
            subRecipe: {
                id: string;
                name: string;
                tenantId: string;
                type: import("@prisma/client").$Enums.RecipeType;
                imageUrl: string | null;
                description: string | null;
                genericCost: number;
                nutritionalInfo: string | null;
            } | null;
        } & {
            id: string;
            unit: string;
            rawMaterialId: string | null;
            quantity: number;
            recipeId: string;
            subRecipeId: string | null;
        })[];
    } & {
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.RecipeType;
        imageUrl: string | null;
        description: string | null;
        genericCost: number;
        nutritionalInfo: string | null;
    }>;
    create(tenantId: string, data: CreateRecipeDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.RecipeType;
        imageUrl: string | null;
        description: string | null;
        genericCost: number;
        nutritionalInfo: string | null;
    }>;
    update(tenantId: string, id: string, data: Partial<CreateRecipeDto>): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.RecipeType;
        imageUrl: string | null;
        description: string | null;
        genericCost: number;
        nutritionalInfo: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.RecipeType;
        imageUrl: string | null;
        description: string | null;
        genericCost: number;
        nutritionalInfo: string | null;
    }>;
}
