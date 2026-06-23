import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerTier } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  create(data: { name: string; phone?: string; email?: string }) {
    return this.prisma.customer.create({ data });
  }

  async findAll() {
    const customers = await this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return this.attachResolvedTier(customers);
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { transactions: true }
    });
    if (!customer) return customer;
    const [resolved] = await this.attachResolvedTier([customer]);
    return resolved;
  }

  async update(id: string, data: any) {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  private async attachResolvedTier<T extends { pointBalance: number; tier: CustomerTier }>(customers: T[]) {
    if (customers.length === 0) return customers;

    const [silverSetting, goldSetting] = await Promise.all([
      this.settingsService.getSetting('SILVER_MIN_POINTS'),
      this.settingsService.getSetting('GOLD_MIN_POINTS'),
    ]);

    const silverMinPoints = Math.max(0, Number(silverSetting?.value ?? '100'));
    const goldMinPoints = Math.max(silverMinPoints, Number(goldSetting?.value ?? '300'));

    return customers.map((customer) => ({
      ...customer,
      tier: this.resolveTier(customer.pointBalance, silverMinPoints, goldMinPoints),
    }));
  }

  private resolveTier(pointBalance: number, silverMinPoints: number, goldMinPoints: number): CustomerTier {
    if (pointBalance >= goldMinPoints) return CustomerTier.GOLD;
    if (pointBalance >= silverMinPoints) return CustomerTier.SILVER;
    return CustomerTier.BRONZE;
  }
}
