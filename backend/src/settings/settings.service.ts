import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { readFileSync } from 'fs';
import { join } from 'path';

const FORCE_PASSWORD_CHANGED_PREFIX = 'PASSWORD_CHANGED_AT:';
const TRANSACTION_PRICING_META_PREFIX = 'TX_PRICING_META:';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    return this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

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

  async setManySettings(settings: Record<string, string>) {
    return Promise.all(
      Object.entries(settings).map(([key, value]) => this.setSetting(key, value)),
    );
  }

  async getAllowRegistration() {
    const setting = await this.getSetting('ALLOW_REGISTRATION');
    return setting ? setting.value === 'true' : true; // Default to true
  }

  getPasswordChangedKey(userId: string) {
    return `${FORCE_PASSWORD_CHANGED_PREFIX}${userId}`;
  }

  getTransactionPricingMetaKey(transactionId: string) {
    return `${TRANSACTION_PRICING_META_PREFIX}${transactionId}`;
  }

  async getForcePasswordChangeRequired(userId: string) {
    const [forceSetting, changedMarker] = await Promise.all([
      this.getSetting('FORCE_PASSWORD_CHANGE'),
      this.getSetting(this.getPasswordChangedKey(userId)),
    ]);

    if (forceSetting?.value !== 'true') return false;
    return !changedMarker?.value;
  }

  async markPasswordChanged(userId: string) {
    return this.setSetting(this.getPasswordChangedKey(userId), new Date().toISOString());
  }

  async saveTransactionPricingMetadata(
    transactionId: string,
    metadata: Record<string, unknown>,
    tx: PrismaService | any = this.prisma,
  ) {
    const key = this.getTransactionPricingMetaKey(transactionId);
    return tx.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(metadata) },
      create: { key, value: JSON.stringify(metadata) },
    });
  }

  async getTransactionPricingMetadataMap(transactionIds: string[]) {
    if (transactionIds.length === 0) return new Map<string, any>();

    const keys = transactionIds.map((id) => this.getTransactionPricingMetaKey(id));
    const settings = await this.prisma.setting.findMany({
      where: { key: { in: keys } },
    });

    return new Map(
      settings.map((setting) => {
        const transactionId = setting.key.replace(TRANSACTION_PRICING_META_PREFIX, '');
        try {
          return [transactionId, JSON.parse(setting.value)];
        } catch {
          return [transactionId, null];
        }
      }),
    );
  }

  getPackageVersions() {
    const backendPackage = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    const frontendPackage = JSON.parse(readFileSync(join(process.cwd(), '..', 'frontend', 'package.json'), 'utf8'));

    return {
      backendVersion: backendPackage.version ?? '0.0.0',
      frontendVersion: frontendPackage.version ?? '0.0.0',
    };
  }

  async getSystemInfo() {
    const [{ backendVersion, frontendVersion }, appVersionSetting, logRetentionSetting] = await Promise.all([
      Promise.resolve(this.getPackageVersions()),
      this.getSetting('APP_VERSION'),
      this.getSetting('LOG_RETENTION_DAYS'),
    ]);

    return {
      appVersion: appVersionSetting?.value || backendVersion,
      backendVersion,
      frontendVersion,
      logRetentionDays: Number(logRetentionSetting?.value ?? '30') || 30,
      generatedAt: new Date().toISOString(),
    };
  }

  async exportBackup() {
    const [systemInfo, settings, users, categories, ingredients, menus, discounts, customers, expenses, shifts, transactions, inventoryLogs] =
      await Promise.all([
        this.getSystemInfo(),
        this.prisma.setting.findMany({ orderBy: { key: 'asc' } }),
        this.prisma.user.findMany({
          orderBy: { createdAt: 'asc' },
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        }),
        this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.ingredient.findMany({ orderBy: { createdAt: 'asc' } }),
        this.prisma.menu.findMany({
          orderBy: { createdAt: 'asc' },
          include: { ingredients: true, category: true },
        }),
        this.prisma.discount.findMany({ orderBy: { code: 'asc' } }),
        this.prisma.customer.findMany({ orderBy: { createdAt: 'asc' } }),
        this.prisma.expense.findMany({ orderBy: { createdAt: 'asc' } }),
        this.prisma.shift.findMany({
          orderBy: { startTime: 'asc' },
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        }),
        this.prisma.transaction.findMany({
          orderBy: { createdAt: 'asc' },
          include: {
            items: { include: { menu: true } },
            customer: true,
            user: { select: { id: true, name: true, email: true, role: true } },
            shift: true,
          },
        }),
        this.prisma.inventoryLog.findMany({
          orderBy: { createdAt: 'asc' },
          include: { ingredient: true },
        }),
      ]);

    return {
      meta: {
        exportedAt: new Date().toISOString(),
        systemInfo,
      },
      data: {
        settings,
        users,
        categories,
        ingredients,
        menus,
        discounts,
        customers,
        expenses,
        shifts,
        transactions,
        inventoryLogs,
      },
    };
  }

  async applyLogRetention() {
    const retentionSetting = await this.getSetting('LOG_RETENTION_DAYS');
    const retentionDays = Number(retentionSetting?.value ?? '30');

    if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
      return { deletedCount: 0 };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.inventoryLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return { deletedCount: result.count };
  }

  async resetDemoData() {
    const summary = await this.prisma.$transaction(async (tx) => {
      const deletedTransactionPricingMeta = await tx.setting.deleteMany({
        where: {
          key: {
            startsWith: TRANSACTION_PRICING_META_PREFIX,
          },
        },
      });
      const deletedTransactionItems = await tx.transactionItem.deleteMany();
      const deletedTransactions = await tx.transaction.deleteMany();
      const deletedInventoryLogs = await tx.inventoryLog.deleteMany();
      const deletedExpenses = await tx.expense.deleteMany();
      const deletedDiscounts = await tx.discount.deleteMany();
      const deletedCustomers = await tx.customer.deleteMany();
      const deletedShifts = await tx.shift.deleteMany();
      const deletedRecipeItems = await tx.recipeItem.deleteMany();
      const deletedMenus = await tx.menu.deleteMany();
      const deletedCategories = await tx.category.deleteMany();
      const deletedIngredients = await tx.ingredient.deleteMany();

      return {
        transactionPricingMeta: deletedTransactionPricingMeta.count,
        transactionItems: deletedTransactionItems.count,
        transactions: deletedTransactions.count,
        inventoryLogs: deletedInventoryLogs.count,
        expenses: deletedExpenses.count,
        discounts: deletedDiscounts.count,
        customers: deletedCustomers.count,
        shifts: deletedShifts.count,
        recipeItems: deletedRecipeItems.count,
        menus: deletedMenus.count,
        categories: deletedCategories.count,
        ingredients: deletedIngredients.count,
      };
    });

    return {
      success: true,
      summary,
    };
  }

  async restoreBackup(backup: any) {
    const data = backup?.data ?? {};

    const summary = await this.prisma.$transaction(async (tx) => {
      const existingUsers = await tx.user.findMany({
        select: { id: true },
      });
      const validUserIds = new Set(existingUsers.map((user) => user.id));

      await tx.transactionItem.deleteMany();
      await tx.transaction.deleteMany();
      await tx.inventoryLog.deleteMany();
      await tx.expense.deleteMany();
      await tx.discount.deleteMany();
      await tx.customer.deleteMany();
      await tx.shift.deleteMany();
      await tx.recipeItem.deleteMany();
      await tx.menu.deleteMany();
      await tx.category.deleteMany();
      await tx.ingredient.deleteMany();
      await tx.setting.deleteMany({
        where: {
          key: {
            not: {
              startsWith: FORCE_PASSWORD_CHANGED_PREFIX,
            },
          },
        },
      });

      const created = {
        settings: 0,
        categories: 0,
        ingredients: 0,
        menus: 0,
        discounts: 0,
        customers: 0,
        expenses: 0,
        shifts: 0,
        transactions: 0,
        inventoryLogs: 0,
      };
      const createdShiftIds = new Set<string>();
      const createdCustomerIds = new Set<string>();

      if (Array.isArray(data.settings) && data.settings.length > 0) {
        await tx.setting.createMany({
          data: data.settings.map((setting: any) => ({ key: String(setting.key), value: String(setting.value) })),
        });
        created.settings = data.settings.length;
      }

      if (Array.isArray(data.categories) && data.categories.length > 0) {
        await tx.category.createMany({
          data: data.categories.map((item: any) => ({ id: item.id, name: item.name })),
        });
        created.categories = data.categories.length;
      }

      if (Array.isArray(data.ingredients) && data.ingredients.length > 0) {
        await tx.ingredient.createMany({
          data: data.ingredients.map((item: any) => ({
            id: item.id,
            name: item.name,
            unit: item.unit,
            costPerUnit: item.costPerUnit,
            stockQuantity: item.stockQuantity,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
        });
        created.ingredients = data.ingredients.length;
      }

      if (Array.isArray(data.menus) && data.menus.length > 0) {
        for (const menu of data.menus) {
          await tx.menu.create({
            data: {
              id: menu.id,
              name: menu.name,
              description: menu.description,
              sellingPrice: menu.sellingPrice,
              imageUrl: menu.imageUrl,
              categoryId: menu.categoryId,
              createdAt: menu.createdAt,
              updatedAt: menu.updatedAt,
              ingredients: {
                create: Array.isArray(menu.ingredients)
                  ? menu.ingredients.map((ingredient: any) => ({
                      id: ingredient.id,
                      ingredientId: ingredient.ingredientId,
                      quantity: ingredient.quantity,
                    }))
                  : [],
              },
            },
          });
          created.menus += 1;
        }
      }

      if (Array.isArray(data.discounts) && data.discounts.length > 0) {
        await tx.discount.createMany({
          data: data.discounts.map((item: any) => ({
            id: item.id,
            code: item.code,
            type: item.type,
            value: item.value,
            isActive: item.isActive,
          })),
        });
        created.discounts = data.discounts.length;
      }

      if (Array.isArray(data.customers) && data.customers.length > 0) {
        await tx.customer.createMany({
          data: data.customers.map((item: any) => ({
            id: item.id,
            name: item.name,
            phone: item.phone,
            email: item.email,
            pointBalance: item.pointBalance,
            tier: item.tier,
            createdAt: item.createdAt,
          })),
        });
        created.customers = data.customers.length;
        data.customers.forEach((item: any) => createdCustomerIds.add(item.id));
      }

      if (Array.isArray(data.expenses) && data.expenses.length > 0) {
        await tx.expense.createMany({
          data: data.expenses.map((item: any) => ({
            id: item.id,
            description: item.description,
            amount: item.amount,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
        });
        created.expenses = data.expenses.length;
      }

      if (Array.isArray(data.shifts) && data.shifts.length > 0) {
        const validShifts = data.shifts.filter((item: any) => validUserIds.has(item.userId));
        if (validShifts.length > 0) {
          await tx.shift.createMany({
            data: validShifts.map((item: any) => ({
            id: item.id,
            userId: item.userId,
            startTime: item.startTime,
            endTime: item.endTime,
            startingCash: item.startingCash,
            actualEndingCash: item.actualEndingCash,
            status: item.status,
            })),
          });
          validShifts.forEach((item: any) => createdShiftIds.add(item.id));
          created.shifts = validShifts.length;
        }
      }

      if (Array.isArray(data.transactions) && data.transactions.length > 0) {
        for (const transaction of data.transactions) {
          await tx.transaction.create({
            data: {
              id: transaction.id,
              orderNumber: transaction.orderNumber,
              totalAmount: transaction.totalAmount,
              paymentMethod: transaction.paymentMethod,
              status: transaction.status,
              orderType: transaction.orderType,
              tableNumber: transaction.tableNumber,
              discountAmount: transaction.discountAmount,
              taxAmount: transaction.taxAmount,
              customerName: transaction.customerName,
              customerId: createdCustomerIds.has(transaction.customerId) ? transaction.customerId : null,
              shiftId: createdShiftIds.has(transaction.shiftId) ? transaction.shiftId : null,
              userId: validUserIds.has(transaction.userId) ? transaction.userId : null,
              createdAt: transaction.createdAt,
              kitchenStatus: transaction.kitchenStatus,
              items: {
                create: Array.isArray(transaction.items)
                  ? transaction.items.map((item: any) => ({
                      id: item.id,
                      quantity: item.quantity,
                      priceAtSale: item.priceAtSale,
                      subtotal: item.subtotal,
                      notes: item.notes,
                      menuId: item.menuId,
                    }))
                  : [],
              },
            },
          });
          created.transactions += 1;
        }
      }

      if (Array.isArray(data.inventoryLogs) && data.inventoryLogs.length > 0) {
        await tx.inventoryLog.createMany({
          data: data.inventoryLogs.map((item: any) => ({
            id: item.id,
            ingredientId: item.ingredientId,
            type: item.type,
            quantity: item.quantity,
            notes: item.notes,
            createdAt: item.createdAt,
            createdBy: item.createdBy,
          })),
        });
        created.inventoryLogs = data.inventoryLogs.length;
      }

      return created;
    });

    return {
      success: true,
      summary,
    };
  }
}
