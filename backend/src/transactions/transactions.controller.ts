import { Controller, Get, Post, Body, Param, UseGuards, Patch, Request } from '@nestjs/common';
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

  @Post()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, createTransactionDto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id/void')
  voidTransaction(@Param('id') id: string) {
    return this.transactionsService.voidTransaction(id);
  }

  @Patch(':id/kitchen')
  updateKitchenStatus(@Param('id') id: string, @Body('status') status: 'PENDING' | 'DONE') {
    return this.transactionsService.updateKitchenStatus(id, status);
  }
}
