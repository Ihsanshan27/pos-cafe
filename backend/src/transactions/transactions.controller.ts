import { Controller, Get, Post, Body, Param, UseGuards, Patch, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @Post()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(req.user, createTransactionDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Get()
  findAll(@Request() req, @Query('outletId') outletId?: string) {
    return this.transactionsService.findAll(req.user, outletId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.transactionsService.findOne(req.user, id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id/void')
  voidTransaction(@Param('id') id: string) {
    return this.transactionsService.voidTransaction(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER, Role.BARISTA)
  @Patch(':id/kitchen')
  updateKitchenStatus(@Request() req, @Param('id') id: string, @Body('status') status: 'PENDING' | 'IN_PROGRESS' | 'DONE') {
    return this.transactionsService.updateKitchenStatus(req.user, id, status);
  }
}
