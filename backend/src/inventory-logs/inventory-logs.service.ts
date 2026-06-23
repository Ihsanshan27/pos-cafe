import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogType } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class InventoryLogsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async create(data: { ingredientId: string; type: LogType; quantity: number; notes?: string; createdBy?: string }) {
    const normalizedNotes = data.notes?.trim();
    const requireAdjustmentNoteSetting = await this.settingsService.getSetting('REQUIRE_ADJUSTMENT_NOTE');
    const requireAdjustmentNote = requireAdjustmentNoteSetting?.value !== 'false';

    if (data.type === 'ADJUSTMENT' && requireAdjustmentNote && !normalizedNotes) {
      throw new BadRequestException('Adjustment note is required');
    }

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

    if (newStock < 0) {
      throw new BadRequestException(`Stock for ${ingredient.name} cannot be negative`);
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
        notes: normalizedNotes,
        createdBy: data.createdBy,
      }
    });
  }

  findAll() {
    return this.prisma.inventoryLog.findMany({
      include: { ingredient: true },
      orderBy: { createdAt: 'desc' },
    }).then(async (logs) => {
      const createdByIds = Array.from(
        new Set(
          logs
            .map((log) => log.createdBy)
            .filter((value): value is string => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value)),
        ),
      );

      const users = createdByIds.length
        ? await this.prisma.user.findMany({
            where: { id: { in: createdByIds } },
            select: { id: true, name: true },
          })
        : [];

      const userMap = new Map(users.map((user) => [user.id, user.name]));

      return logs.map((log) => ({
        ...log,
        createdByName: typeof log.createdBy === 'string'
          ? userMap.get(log.createdBy) ?? log.createdBy
          : null,
      }));
    });
  }
}
