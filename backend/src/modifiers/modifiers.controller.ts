import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ModifiersService } from './modifiers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('modifiers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModifiersController {
  constructor(private readonly modifiersService: ModifiersService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Body() data: any) {
    return this.modifiersService.create(data);
  }

  @Get()
  findAll() {
    return this.modifiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modifiersService.findOne(id);
  }

  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any) {
    return this.modifiersService.update(id, data);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.modifiersService.remove(id);
  }
}
