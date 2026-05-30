import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @Post()
  create(@Body() data: { name: string; phone?: string; email?: string }) {
    return this.customersService.create(data);
  }

  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.customersService.update(id, data);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
