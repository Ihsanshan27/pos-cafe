import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OutletsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug: string; address?: string; phone?: string; isActive?: boolean }) {
    return this.prisma.outlet.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase(),
        address: data.address?.trim(),
        phone: data.phone?.trim(),
        isActive: data.isActive ?? true,
      },
      include: { tableQRCodes: true },
    });
  }

  findAll() {
    return this.prisma.outlet.findMany({
      include: {
        tableQRCodes: true,
        _count: {
          select: {
            users: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.outlet.findUnique({
      where: { id },
      include: { tableQRCodes: true },
    });
  }

  update(id: string, data: { name?: string; slug?: string; address?: string; phone?: string; isActive?: boolean }) {
    return this.prisma.outlet.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.slug !== undefined ? { slug: data.slug.trim().toLowerCase() } : {}),
        ...(data.address !== undefined ? { address: data.address.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: { tableQRCodes: true },
    });
  }

  async remove(id: string) {
    const relatedTransactions = await this.prisma.transaction.count({ where: { outletId: id } });
    if (relatedTransactions > 0) {
      throw new BadRequestException('Outlet cannot be deleted because it already has transactions');
    }
    return this.prisma.outlet.delete({ where: { id } });
  }

  createTableQr(outletId: string, data: { code: string; label?: string; isActive?: boolean }) {
    return this.prisma.tableQRCode.create({
      data: {
        outletId,
        code: data.code.trim().toUpperCase(),
        label: data.label?.trim(),
        isActive: data.isActive ?? true,
      },
    });
  }

  updateTableQr(id: string, data: { code?: string; label?: string; isActive?: boolean }) {
    return this.prisma.tableQRCode.update({
      where: { id },
      data: {
        ...(data.code !== undefined ? { code: data.code.trim().toUpperCase() } : {}),
        ...(data.label !== undefined ? { label: data.label.trim() } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  removeTableQr(id: string) {
    return this.prisma.tableQRCode.delete({ where: { id } });
  }

  async findPublicOutletTable(outletSlug: string, tableCode: string) {
    const outlet = await this.prisma.outlet.findUnique({
      where: { slug: outletSlug.toLowerCase() },
      include: {
        tableQRCodes: {
          where: {
            code: tableCode.toUpperCase(),
            isActive: true,
          },
        },
      },
    });

    if (!outlet || !outlet.isActive || outlet.tableQRCodes.length === 0) {
      throw new BadRequestException('Outlet or table QR not found');
    }

    return outlet;
  }
}
