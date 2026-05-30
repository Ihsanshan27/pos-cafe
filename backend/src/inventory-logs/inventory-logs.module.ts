import { Module } from '@nestjs/common';
import { InventoryLogsService } from './inventory-logs.service';
import { InventoryLogsController } from './inventory-logs.controller';

@Module({
  controllers: [InventoryLogsController],
  providers: [InventoryLogsService],
})
export class InventoryLogsModule {}
