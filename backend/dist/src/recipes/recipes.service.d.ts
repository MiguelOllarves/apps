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
            tenantId: string;
            recipeId: string;
            categoryId: string;
            price: number;
            currencyId: string;
            isAvailable: boolean;
        } | null;
        ingredients: ({
            rawMaterial: {
                id: string;
                name: string;
                tenantId: string;
                categoryId: string;
                unit: import("@prisma/client").$Enums.UnitType;
                currentStock: number;
                minStockAlert: number;
                baseCost: number;
                replacementCost: number;
                yieldPercentage: number;
                shrinkagePercentage: number;
                updatedAt: Date;
            } | null;
            subRecipe: {
                id: string;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.RecipeType;
                genericCost: number;
                nutritionalInfo: string | null;
                imageUrl: string | null;
                tenantId: string;
            } | null;
        } & {
            id: string;
            recipeId: string;
            rawMaterialId: string | null;
            subRecipeId: string | null;
            quantity: number;
            unit: string;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.RecipeType;
        genericCost: number;
        nutritionalInfo: string | null;
        imageUrl: string | null;
        tenantId: string;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        ingredients: ({
            rawMaterial: {
                id: string;
                name: string;
                tenantId: string;
                categoryId: string;
                unit: import("@prisma/client").$Enums.UnitType;
                currentStock: number;
                minStockAlert: number;
                baseCost: number;
                replacementCost: number;
                yieldPercentage: number;
                shrinkagePercentage: number;
                updatedAt: Date;
            } | null;
            subRecipe: {
                id: string;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.RecipeType;
                genericCost: number;
                nutritionalInfo: string | null;
                imageUrl: string | null;
                tenantId: string;
            } | null;
        } & {
            id: string;
            recipeId: string;
            rawMaterialId: string | null;
            subRecipeId: string | null;
            quantity: number;
            unit: string;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.RecipeType;
        genericCost: number;
        nutritionalInfo: string | null;
        imageUrl: string | null;
        tenantId: string;
    }>;
    create(tenantId: string, data: CreateRecipeDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.RecipeType;
        genericCost: number;
        nutritionalInfo: string | null;
        imageUrl: string | null;
        tenantId: string;
    }>;
    update(tenantId: string, id: string, data: Partial<CreateRecipeDto>): Promise<{
        id: string;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.RecipeType;
        genericCost: number;
        nutritionalInfo: string | null;
        imageUrl: string | null;
        tenantId: string;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.RecipeType;
        genericCost: number;
        nutritionalInfo: string | null;
        imageUrl: string | null;
        tenantId: string;
    }>;
}
