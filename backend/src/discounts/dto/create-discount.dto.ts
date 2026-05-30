import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  code: string;

  @IsString()
  type: string; // PERCENTAGE or FIXED

  @IsNumber()
  value: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
