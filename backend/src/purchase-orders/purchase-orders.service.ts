import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseOrderStatus } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    supplierId: string;
    outletId?: string;
    notes?: string;
    expectedDate?: string;
    items: Array<{ ingredientId: string; quantity: number; unitCost: number }>;
  }) {
    if (!data.items?.length) {
      throw new BadRequestException('Purchase order items are required');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const countToday = await this.prisma.purchaseOrder.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    const seq = String(countToday + 1).padStart(4, '0');
    const orderNumber = `PO-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${seq}`;

    return this.prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: data.supplierId,
        outletId: data.outletId,
        createdById: userId,
        notes: data.notes?.trim(),
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
        items: {
          create: data.items.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: this.defaultInclude(),
    });
  }

  findAll(outletId?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: outletId ? { outletId } : undefined,
      include: this.defaultInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
  }

  updateStatus(id: string, userId: string, status: PurchaseOrderStatus, receivedQuantities?: Record<string, number>) {
    return this.prisma.$transaction(async (tx) => {
      const purchaseOrder = await tx.purchaseOrder.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              ingredient: true,
            },
          },
        },
      });
      if (!purchaseOrder) throw new BadRequestException('Purchase order not found');

      if (status === 'RECEIVED') {
        for (const item of purchaseOrder.items) {
          const receivedQuantity = Math.max(0, Number(receivedQuantities?.[item.id] ?? item.quantity));
          await tx.purchaseOrderItem.update({
            where: { id: item.id },
            data: { receivedQuantity },
          });
          await tx.ingredient.update({
            where: { id: item.ingredientId },
            data: {
              stockQuantity: { increment: receivedQuantity },
              costPerUnit: item.unitCost,
            },
          });
          await tx.inventoryLog.create({
            data: {
              ingredientId: item.ingredientId,
              type: 'IN',
              quantity: receivedQuantity,
              notes: `Received from ${purchaseOrder.orderNumber}`,
              createdBy: userId,
            },
          });
        }
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status,
          receivedAt: status === 'RECEIVED' ? new Date() : null,
        },
        include: this.defaultInclude(),
      });
    });
  }

  private defaultInclude() {
    return {
      supplier: true,
      outlet: true,
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: {
        include: {
          ingredient: true,
        },
      },
    } as const;
  }
}
