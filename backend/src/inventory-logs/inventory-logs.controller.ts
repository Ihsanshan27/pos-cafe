import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { InventoryLogsService } from './inventory-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, LogType } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory-logs')
export class InventoryLogsController {
  constructor(private readonly inventoryLogsService: InventoryLogsService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Body() data: { ingredientId: string; type: LogType; quantity: number; notes?: string; outletId?: string }, @Request() req: any) {
    const resolvedOutletId = req.user.role === Role.OWNER ? data.outletId : (req.user.outletId || data.outletId);
    return this.inventoryLogsService.create({
      ...data,
      outletId: resolvedOutletId,
      createdBy: req.user.name || req.user.id,
    });
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  findAll(@Request() req: any, @Query('outletId') outletId?: string) {
    const resolvedOutletId = req.user.role === Role.OWNER ? outletId : (req.user.outletId || outletId);
    return this.inventoryLogsService.findAll(resolvedOutletId);
  }
}
