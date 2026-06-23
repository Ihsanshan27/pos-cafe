import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OutletsService } from './outlets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER)
@Controller('outlets')
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Post()
  create(@Body() body: { name: string; slug: string; address?: string; phone?: string; isActive?: boolean }) {
    return this.outletsService.create(body);
  }

  @Get()
  findAll() {
    return this.outletsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.outletsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; slug?: string; address?: string; phone?: string; isActive?: boolean }) {
    return this.outletsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.outletsService.remove(id);
  }

  @Post(':id/tables')
  createTable(@Param('id') id: string, @Body() body: { code: string; label?: string; isActive?: boolean }) {
    return this.outletsService.createTableQr(id, body);
  }

  @Patch('tables/:id')
  updateTable(@Param('id') id: string, @Body() body: { code?: string; label?: string; isActive?: boolean }) {
    return this.outletsService.updateTableQr(id, body);
  }

  @Delete('tables/:id')
  removeTable(@Param('id') id: string) {
    return this.outletsService.removeTableQr(id);
  }
}
