import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { saveOptimizedImage } from '../common/image-upload.util';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get()
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get('allow-registration')
  async getAllowRegistration() {
    const allowed = await this.settingsService.getAllowRegistration();
    return { allowed };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Patch('allow-registration')
  async setAllowRegistration(@Body('allowed') allowed: boolean) {
    await this.settingsService.setSetting('ALLOW_REGISTRATION', allowed ? 'true' : 'false');
    return { allowed };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Patch()
  async setManySettings(@Body('settings') settings: Record<string, string>) {
    return this.settingsService.setManySettings(settings ?? {});
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('upload-logo')
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
  async uploadLogo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const { imageUrl } = await saveOptimizedImage({
      buffer: file.buffer,
      prefix: 'store-logo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 82,
    });
    await this.settingsService.setSetting('STORE_LOGO_URL', imageUrl);

    return { imageUrl };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('system-info')
  async getSystemInfo() {
    return this.settingsService.getSystemInfo();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('export-backup')
  async exportBackup() {
    return this.settingsService.exportBackup();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('restore-backup')
  async restoreBackup(@Body('backup') backup: any) {
    if (!backup?.data) {
      throw new BadRequestException('Backup payload is required');
    }
    return this.settingsService.restoreBackup(backup);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('apply-log-retention')
  async applyLogRetention() {
    return this.settingsService.applyLogRetention();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('reset-demo-data')
  async resetDemoData() {
    return this.settingsService.resetDemoData();
  }

  @Get(':key')
  async getGenericSetting(@Param('key') key: string) {
    const setting = await this.settingsService.getSetting(key);
    return setting || { key, value: null };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Patch(':key')
  async setGenericSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.settingsService.setSetting(key, value);
  }
}
