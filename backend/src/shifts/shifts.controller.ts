import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Post()
  create(@Request() req, @Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(req.user.id, createShiftDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Get()
  findAll(@Request() req, @Query('outletId') outletId?: string) {
    return this.shiftsService.findAll(req.user, outletId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Get('active')
  findActive(@Request() req, @Query('outletId') outletId?: string) {
    return this.shiftsService.findActive(req.user, outletId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Get(':id/summary')
  getShiftSummary(@Request() req, @Param('id') id: string) {
    return this.shiftsService.getShiftSummary(req.user, id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.shiftsService.findOne(req.user, id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(req.user, id, updateShiftDto);
  }
}
