import { IsString, IsNumber, Min } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;
}
