import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryLogDto } from './create-inventory-log.dto';

export class UpdateInventoryLogDto extends PartialType(CreateInventoryLogDto) {}
