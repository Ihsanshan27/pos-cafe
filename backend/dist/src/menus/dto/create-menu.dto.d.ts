export declare class RecipeItemDto {
    ingredientId: string;
    quantity: number;
}
export declare class ModifierOptionDto {
    name: string;
    price: number;
}
export declare class ModifierGroupDto {
    name: string;
    isRequired: boolean;
    isMultiple: boolean;
    options: ModifierOptionDto[];
}
export declare class CreateMenuDto {
    name: string;
    description?: string;
    sellingPrice: number;
    imageUrl?: string;
    categoryId?: string;
    ingredients?: RecipeItemDto[];
    modifierGroups?: ModifierGroupDto[];
}
