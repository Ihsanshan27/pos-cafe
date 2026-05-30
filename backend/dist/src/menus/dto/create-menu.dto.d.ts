export declare class RecipeItemDto {
    ingredientId: string;
    quantity: number;
}
export declare class CreateMenuDto {
    name: string;
    description?: string;
    sellingPrice: number;
    imageUrl?: string;
    categoryId?: string;
    ingredients?: RecipeItemDto[];
}
