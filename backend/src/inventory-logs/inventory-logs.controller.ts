import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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
  create(@Body() data: { ingredientId: string; type: LogType; quantity: number; notes?: string }, @Request() req: any) {
    return this.inventoryLogsService.create({
      ...data,
      createdBy: req.user.name || req.user.id,
    });
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  findAll() {
    return this.inventoryLogsService.findAll();
  }
}
