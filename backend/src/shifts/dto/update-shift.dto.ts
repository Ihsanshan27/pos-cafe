import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateShiftDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  actualEndingCash?: number;

  @IsOptional()
  @IsIn(['OPEN', 'CLOSED'])
  status?: 'OPEN' | 'CLOSED';

  @IsOptional()
  @IsString()
  notes?: string;
}
