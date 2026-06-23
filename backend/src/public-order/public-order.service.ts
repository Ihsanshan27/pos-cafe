import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OutletsService } from '../outlets/outlets.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class PublicOrderService {
  constructor(
    private prisma: PrismaService,
    private outletsService: OutletsService,
    private transactionsService: TransactionsService,
  ) {}

  async getMenu(outletSlug: string, tableCode: string) {
    const outlet = await this.outletsService.findPublicOutletTable(outletSlug, tableCode);
    const [menus, categories] = await Promise.all([
      this.prisma.menu.findMany({
        include: {
          category: true,
          ingredients: {
            include: {
              ingredient: true,
            },
          },
          outletMenus: {
            where: { outletId: outlet.id },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ]);

    const mappedMenus = menus
      .map((menu) => {
        const { outletMenus, ...menuData } = menu;
        const override = outletMenus[0];
        return {
          ...menuData,
          sellingPrice: override ? override.sellingPrice : menu.sellingPrice,
          isActive: override ? override.isActive : true,
        };
      })
      .filter((menu) => menu.isActive);

    return {
      outlet: {
        id: outlet.id,
        name: outlet.name,
        slug: outlet.slug,
        address: outlet.address,
        phone: outlet.phone,
      },
      table: outlet.tableQRCodes[0],
      categories,
      menus: mappedMenus,
    };
  }

  async createOrder(
    outletSlug: string,
    tableCode: string,
    data: {
      customerName?: string;
      items: Array<{ menuId: string; quantity: number; notes?: string }>;
    },
  ) {
    const outlet = await this.outletsService.findPublicOutletTable(outletSlug, tableCode);
    return this.transactionsService.create(null, {
      items: data.items,
      customerName: data.customerName?.trim(),
      orderType: 'DINE_IN',
      tableNumber: outlet.tableQRCodes[0].label || outlet.tableQRCodes[0].code,
      outletId: outlet.id,
      source: 'PUBLIC_QR',
      status: 'PENDING',
      paymentMethod: 'CASH',
    });
  }
}
