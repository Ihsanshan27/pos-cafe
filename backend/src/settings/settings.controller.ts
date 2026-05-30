import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

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
