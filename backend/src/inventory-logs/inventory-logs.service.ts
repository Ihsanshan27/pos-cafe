import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogType } from '@prisma/client';

@Injectable()
export class InventoryLogsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { ingredientId: string; type: LogType; quantity: number; notes?: string; createdBy?: string }) {
    // Also update ingredient stock automatically
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id: data.ingredientId } });
    if (!ingredient) throw new BadRequestException('Ingredient not found');

    let newStock = Number(ingredient.stockQuantity);
    if (data.type === 'IN') {
      newStock += data.quantity;
    } else if (data.type === 'OUT' || data.type === 'SALE' || data.type === 'VOID') {
      if (data.type === 'VOID') newStock += data.quantity; // Void implies returned stock
      else newStock -= data.quantity;
    } else if (data.type === 'ADJUSTMENT') {
      // adjustment could be positive or negative depending on payload logic
      newStock += data.quantity;
    }

    await this.prisma.ingredient.update({
      where: { id: data.ingredientId },
      data: { stockQuantity: newStock }
    });

    return this.prisma.inventoryLog.create({
      data: {
        ingredientId: data.ingredientId,
        type: data.type,
        quantity: data.quantity,
        notes: data.notes,
        createdBy: data.createdBy,
      }
    });
  }

  findAll() {
    return this.prisma.inventoryLog.findMany({
      include: { ingredient: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
