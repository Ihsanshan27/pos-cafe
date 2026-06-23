import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateShiftDto {
  @IsNumber()
  startingCash: number;

  @IsOptional()
  @IsString()
  outletId?: string;
}
