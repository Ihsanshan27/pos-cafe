import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSetting(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key }
    });
    return setting;
  }

  async setSetting(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  async getAllowRegistration() {
    const setting = await this.getSetting('ALLOW_REGISTRATION');
    return setting ? setting.value === 'true' : true; // Default to true
  }
}
