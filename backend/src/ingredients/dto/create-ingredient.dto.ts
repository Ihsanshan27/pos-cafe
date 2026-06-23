import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  outletId?: string;
}
