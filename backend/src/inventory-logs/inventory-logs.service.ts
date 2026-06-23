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

  async create(data: { ingredientId: string; type: LogType; quantity: number; notes?: string; createdBy?: string; outletId?: string }) {
    const normalizedNotes = data.notes?.trim();
    const requireAdjustmentNoteSetting = await this.settingsService.getSetting('REQUIRE_ADJUSTMENT_NOTE');
    const requireAdjustmentNote = requireAdjustmentNoteSetting?.value !== 'false';

    if (data.type === 'ADJUSTMENT' && requireAdjustmentNote && !normalizedNotes) {
      throw new BadRequestException('Adjustment note is required');
    }

    const ingredient = await this.prisma.ingredient.findUnique({ where: { id: data.ingredientId } });
    if (!ingredient) throw new BadRequestException('Ingredient not found');

    const outletIngredient = data.outletId
      ? await this.prisma.outletIngredient.findUnique({
          where: {
            outletId_ingredientId: {
              outletId: data.outletId,
              ingredientId: data.ingredientId,
            },
          },
        })
      : null;

    let newStock = Number(outletIngredient?.stockQuantity ?? 0);
    if (data.type === 'IN') {
      newStock += data.quantity;
    } else if (data.type === 'OUT' || data.type === 'SALE' || data.type === 'VOID') {
      if (data.type === 'VOID') newStock += data.quantity;
      else newStock -= data.quantity;
    } else if (data.type === 'ADJUSTMENT') {
      newStock += data.quantity;
    }

    if (newStock < 0) {
      throw new BadRequestException(`Stock for ${ingredient.name} cannot be negative`);
    }

    if (data.outletId) {
      await this.prisma.outletIngredient.upsert({
        where: {
          outletId_ingredientId: {
            outletId: data.outletId,
            ingredientId: data.ingredientId,
          },
        },
        update: { stockQuantity: newStock },
        create: {
          outletId: data.outletId,
          ingredientId: data.ingredientId,
          stockQuantity: newStock,
        },
      });
    }

    return this.prisma.inventoryLog.create({
      data: {
        ingredientId: data.ingredientId,
        outletId: data.outletId,
        type: data.type,
        quantity: data.quantity,
        notes: normalizedNotes,
        createdBy: data.createdBy,
      }
    });
  }

  findAll(outletId?: string) {
    return this.prisma.inventoryLog.findMany({
      where: outletId ? { outletId } : undefined,
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
