import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class UpdateShiftDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  actualEndingCash?: number;

  @IsOptional()
  @IsIn(['OPEN', 'CLOSED'])
  status?: 'OPEN' | 'CLOSED';
}
