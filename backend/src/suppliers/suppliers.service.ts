import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; phone?: string; email?: string; address?: string; notes?: string; isActive?: boolean }) {
    return this.prisma.supplier.create({
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim(),
        email: data.email?.trim(),
        address: data.address?.trim(),
        notes: data.notes?.trim(),
        isActive: data.isActive ?? true,
      },
    });
  }

  findAll() {
    return this.prisma.supplier.findMany({
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  update(id: string, data: { name?: string; phone?: string; email?: string; address?: string; notes?: string; isActive?: boolean }) {
    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email.trim() } : {}),
        ...(data.address !== undefined ? { address: data.address.trim() } : {}),
        ...(data.notes !== undefined ? { notes: data.notes.trim() } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }
}
