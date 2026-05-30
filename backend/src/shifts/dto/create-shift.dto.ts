import { IsNumber } from 'class-validator';

export class CreateShiftDto {
  @IsNumber()
  startingCash: number;
}
