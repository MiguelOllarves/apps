import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/recipes.dto';
export declare class RecipesController {
    private readonly recipesService;
    constructor(recipesService: RecipesService);
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
    calculateCost(tenantId: string, id: string): Promise<number>;
    consumeRecipe(tenantId: string, id: string): Promise<void>;
    create(tenantId: string, dto: CreateRecipeDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.RecipeType;
        genericCost: number;
        nutritionalInfo: string | null;
        imageUrl: string | null;
        tenantId: string;
    }>;
    update(tenantId: string, id: string, dto: Partial<CreateRecipeDto>): Promise<{
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
