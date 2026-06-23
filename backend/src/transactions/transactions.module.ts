import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';
import { KdsGateway } from './kds.gateway';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, KdsGateway],
  exports: [TransactionsService, KdsGateway],
})
export class TransactionsModule {}
