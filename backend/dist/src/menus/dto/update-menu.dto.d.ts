import { RecipeItemDto, ModifierGroupDto } from './create-menu.dto';
export declare class UpdateMenuDto {
    name?: string;
    description?: string;
    sellingPrice?: number;
    imageUrl?: string;
    ingredients?: RecipeItemDto[];
    categoryId?: string | null;
    modifierGroups?: ModifierGroupDto[];
}
