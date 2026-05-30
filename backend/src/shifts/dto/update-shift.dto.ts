import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateShiftDto {
  @IsOptional()
  @IsNumber()
  actualEndingCash?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
