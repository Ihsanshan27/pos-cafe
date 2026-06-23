import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PurchaseOrderStatus, Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  create(
    @Request() req,
    @Body() body: {
      supplierId: string;
      outletId?: string;
      notes?: string;
      expectedDate?: string;
      items: Array<{ ingredientId: string; quantity: number; unitCost: number }>;
    },
  ) {
    return this.purchaseOrdersService.create(req.user.id, body);
  }

  @Get()
  findAll(@Query('outletId') outletId?: string) {
    return this.purchaseOrdersService.findAll(outletId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { status: PurchaseOrderStatus; receivedQuantities?: Record<string, number> },
  ) {
    return this.purchaseOrdersService.updateStatus(id, req.user.id, body.status, body.receivedQuantities);
  }
}
