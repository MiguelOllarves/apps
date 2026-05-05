import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/recipes.dto';
export declare class RecipesController {
    private readonly recipesService;
    constructor(recipesService: RecipesService);
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
    calculateCost(tenantId: string, id: string): Promise<number>;
    consumeRecipe(tenantId: string, id: string): Promise<void>;
    create(tenantId: string, dto: CreateRecipeDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.RecipeType;
        imageUrl: string | null;
        description: string | null;
        genericCost: number;
        nutritionalInfo: string | null;
    }>;
    update(tenantId: string, id: string, dto: Partial<CreateRecipeDto>): Promise<{
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
