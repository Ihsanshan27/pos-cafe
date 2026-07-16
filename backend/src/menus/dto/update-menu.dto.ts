import { IsString, IsNumber, Min, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipeItemDto } from './create-menu.dto';

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  ingredients?: RecipeItemDto[];

  @IsOptional()
  categoryId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modifierGroupIds?: string[];
}
