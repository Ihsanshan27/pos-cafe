import { Module } from '@nestjs/common';
import { PublicOrderController } from './public-order.controller';
import { PublicOrderService } from './public-order.service';
import { OutletsModule } from '../outlets/outlets.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PublicOrderRateLimitGuard } from '../common/simple-rate-limit.guard';

@Module({
  imports: [OutletsModule, TransactionsModule],
  controllers: [PublicOrderController],
  providers: [PublicOrderService, PublicOrderRateLimitGuard],
})
export class PublicOrderModule {}
