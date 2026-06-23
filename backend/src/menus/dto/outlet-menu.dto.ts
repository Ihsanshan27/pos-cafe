import { IsString, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateOutletMenuDto {
  @IsString()
  outletId: string;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsBoolean()
  isActive: boolean;
}
