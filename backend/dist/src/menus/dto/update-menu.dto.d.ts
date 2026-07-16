import { RecipeItemDto } from './create-menu.dto';
export declare class UpdateMenuDto {
    name?: string;
    description?: string;
    sellingPrice?: number;
    imageUrl?: string;
    ingredients?: RecipeItemDto[];
    categoryId?: string | null;
    modifierGroupIds?: string[];
}
