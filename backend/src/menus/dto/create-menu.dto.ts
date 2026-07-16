import { IsString, IsNumber, Min, IsOptional, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeItemDto {
  @IsString()
  ingredientId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}


export class CreateMenuDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  ingredients?: RecipeItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modifierGroupIds?: string[];
}
