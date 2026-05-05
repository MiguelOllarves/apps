export declare class RecipeIngredientDto {
    rawMaterialId: string;
    quantity: number;
    unit: string;
}
export declare class CreateRecipeDto {
    name: string;
    price: number;
    categoryId?: string;
    currencyId?: string;
    ingredients?: RecipeIngredientDto[];
    imageUrl?: string;
}
