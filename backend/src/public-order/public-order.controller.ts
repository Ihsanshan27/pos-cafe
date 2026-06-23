import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PublicOrderService } from './public-order.service';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';
import { PublicOrderRateLimitGuard } from '../common/simple-rate-limit.guard';

@Controller('public/order')
export class PublicOrderController {
  constructor(private readonly publicOrderService: PublicOrderService) {}

  @Get(':outletSlug/:tableCode')
  getMenu(@Param('outletSlug') outletSlug: string, @Param('tableCode') tableCode: string) {
    return this.publicOrderService.getMenu(outletSlug, tableCode);
  }

  @UseGuards(PublicOrderRateLimitGuard)
  @Post(':outletSlug/:tableCode')
  createOrder(
    @Param('outletSlug') outletSlug: string,
    @Param('tableCode') tableCode: string,
    @Body() body: CreatePublicOrderDto,
  ) {
    return this.publicOrderService.createOrder(outletSlug, tableCode, body);
  }
}
