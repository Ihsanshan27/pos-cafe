import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors, BadRequestException, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateOutletMenuDto } from './dto/outlet-menu.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { saveOptimizedImage } from '../common/image-upload.util';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return saveOptimizedImage({
      buffer: file.buffer,
      prefix: 'menu',
      maxWidth: 1400,
      maxHeight: 1400,
      quality: 80,
    });
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  findAll(@Query('outletId') outletId?: string) {
    return this.menusService.findAll(outletId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('outletId') outletId?: string) {
    return this.menusService.findOne(id, outletId);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto, req.user, req.ip);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id/outlet-override')
  upsertOutletOverride(@Request() req: any, @Param('id') id: string, @Body() updateOutletMenuDto: UpdateOutletMenuDto) {
    return this.menusService.upsertOutletOverride(id, updateOutletMenuDto, req.user, req.ip);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Delete(':id/outlet-override/:outletId')
  deleteOutletOverride(@Request() req: any, @Param('id') id: string, @Param('outletId') outletId: string) {
    return this.menusService.deleteOutletOverride(id, outletId, req.user, req.ip);
  }

  @Roles(Role.OWNER)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.menusService.remove(id, req.user, req.ip);
  }
}
