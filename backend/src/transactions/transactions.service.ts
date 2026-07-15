import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus, PaymentMethod, CustomerTier, Role } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';
import { calculatePricing, type RoundingMode } from './pricing.util';
import { sanitizeUser } from '../common/user-response.util';
import { KdsGateway } from './kds.gateway';

type AuthenticatedUser = {
  id: string;
  role: Role;
  outletId?: string | null;
};

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private kdsGateway: KdsGateway,
  ) {}

  async create(user: AuthenticatedUser | null, createTransactionDto: CreateTransactionDto) {
    const {
      items,
      status,
      paymentMethod,
      orderType,
      tableNumber,
      discountAmount,
      shiftId,
      customerName,
      customerId,
      outletId,
      source,
    } = createTransactionDto;
    const userId = user?.id ?? null;
    const scopedOutletId = this.resolveScopedOutletId(user, outletId, source);
    const [
      requireTableNumberSetting,
      requireCustomerNameSetting,
      enabledPaymentMethodsSetting,
      taxEnabledSetting,
      taxRateSetting,
      taxInclusiveSetting,
      roundingModeSetting,
      roundingStepSetting,
      lowStockThresholdSetting,
      blockSaleOnLowStockSetting,
      loyaltyEnabledSetting,
      pointsPerSpendSetting,
      silverMinPointsSetting,
      goldMinPointsSetting,
    ] = await Promise.all([
      this.settingsService.getSetting('REQUIRE_TABLE_NUMBER'),
      this.settingsService.getSetting('REQUIRE_CUSTOMER_NAME'),
      this.settingsService.getSetting('ENABLED_PAYMENT_METHODS'),
      this.settingsService.getSetting('TAX_ENABLED'),
      this.settingsService.getSetting('TAX_RATE'),
      this.settingsService.getSetting('TAX_INCLUSIVE'),
      this.settingsService.getSetting('ROUNDING_MODE'),
      this.settingsService.getSetting('ROUNDING_STEP'),
      this.settingsService.getSetting('LOW_STOCK_THRESHOLD'),
      this.settingsService.getSetting('BLOCK_SALE_ON_LOW_STOCK'),
      this.settingsService.getSetting('LOYALTY_ENABLED'),
      this.settingsService.getSetting('POINTS_PER_SPEND'),
      this.settingsService.getSetting('SILVER_MIN_POINTS'),
      this.settingsService.getSetting('GOLD_MIN_POINTS'),
    ]);
    const selectedOrderType = orderType || 'DINE_IN';
    const normalizedTableNumber = tableNumber?.trim();
    const normalizedCustomerName = customerName?.trim();
    const requireTableNumber = requireTableNumberSetting?.value === 'true';
    const requireCustomerName = requireCustomerNameSetting?.value === 'true';
    const enabledPaymentMethods = (() => {
      try {
        const parsed = JSON.parse(enabledPaymentMethodsSetting?.value ?? '["CASH","QRIS","DEBIT","EWALLET"]');
        return Array.isArray(parsed) ? parsed : ['CASH', 'QRIS', 'DEBIT', 'EWALLET'];
      } catch {
        return ['CASH', 'QRIS', 'DEBIT', 'EWALLET'];
      }
    })();
    const taxEnabled = taxEnabledSetting?.value === 'true';
    const parsedTaxRate = Number(taxRateSetting?.value ?? '10');
    const taxInclusive = taxInclusiveSetting?.value === 'true';
    const roundingMode =
      roundingModeSetting?.value === 'UP' ||
      roundingModeSetting?.value === 'DOWN' ||
      roundingModeSetting?.value === 'NEAREST'
        ? (roundingModeSetting.value as RoundingMode)
        : 'NONE';
    const parsedRoundingStep = Number(roundingStepSetting?.value ?? '0');
    const lowStockThreshold = Math.max(0, Number(lowStockThresholdSetting?.value ?? '10'));
    const blockSaleOnLowStock = blockSaleOnLowStockSetting?.value === 'true';
    const loyaltyEnabled = loyaltyEnabledSetting?.value !== 'false';
    const pointsPerSpend = Math.max(1, Number(pointsPerSpendSetting?.value ?? '10000'));
    const silverMinPoints = Math.max(0, Number(silverMinPointsSetting?.value ?? '100'));
    const goldMinPoints = Math.max(silverMinPoints, Number(goldMinPointsSetting?.value ?? '300'));

    if (requireTableNumber && selectedOrderType === 'DINE_IN' && !normalizedTableNumber) {
      throw new BadRequestException('Table number is required for dine in orders');
    }

    if (requireCustomerName && selectedOrderType === 'TAKEAWAY' && !customerId && !normalizedCustomerName) {
      throw new BadRequestException('Customer name is required for takeaway orders');
    }

    if (paymentMethod && !enabledPaymentMethods.includes(paymentMethod)) {
      throw new BadRequestException(`Payment method ${paymentMethod} is currently disabled`);
    }

    const createdTransaction = await this.prisma.$transaction(async (tx) => {
      if (!scopedOutletId) {
        throw new BadRequestException('Outlet ID is required for transactions');
      }
      const outlet = await tx.outlet.findUnique({ where: { id: scopedOutletId } });
      if (!outlet || !outlet.isActive) {
        throw new BadRequestException('Outlet not found or inactive');
      }

      // 1. Fetch all menus with their recipe items and ingredients
      const menuIds = items.map((item) => item.menuId);
      const menus = await tx.menu.findMany({
        where: { id: { in: menuIds } },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
          outletMenus: {
            where: { outletId: scopedOutletId },
          },
        },
      });

      if (menus.length !== menuIds.length) {
        throw new BadRequestException('One or more menu items not found');
      }

      // 2. Aggregate stock deductions per ingredient across all items
      const stockDeductions = new Map<string, number>();

      for (const orderItem of items) {
        const menu = menus.find((m) => m.id === orderItem.menuId);
        if (!menu) throw new BadRequestException(`Menu ${orderItem.menuId} not found`);

        for (const recipeItem of menu.ingredients) {
          const deductionKey = recipeItem.ingredientId;
          const deductionAmount = recipeItem.quantity * orderItem.quantity;
          stockDeductions.set(
            deductionKey,
            (stockDeductions.get(deductionKey) ?? 0) + deductionAmount,
          );
        }
      }

      // 3. Validate sufficient stock before any deduction
      for (const [ingredientId, deductionAmount] of stockDeductions.entries()) {
        const ingredient = await tx.ingredient.findUnique({
          where: { id: ingredientId },
        });
        if (!ingredient) {
          throw new BadRequestException(`Ingredient ${ingredientId} not found`);
        }

        const outletIngredient = await tx.outletIngredient.findUnique({
          where: {
            outletId_ingredientId: {
              outletId: scopedOutletId,
              ingredientId: ingredientId,
            },
          },
        });
        const currentStock = outletIngredient?.stockQuantity ?? 0;

        if (currentStock < deductionAmount) {
          throw new BadRequestException(
            `Insufficient stock for ingredient: ${ingredient.name}. ` +
            `Available: ${currentStock} ${ingredient.unit}, ` +
            `Required: ${deductionAmount} ${ingredient.unit}`,
          );
        }
        if (blockSaleOnLowStock && currentStock - deductionAmount < lowStockThreshold) {
          throw new BadRequestException(
            `Stock ${ingredient.name} would fall below minimum threshold (${lowStockThreshold} ${ingredient.unit})`,
          );
        }
      }

      // 4. Deduct stock for each ingredient and write InventoryLog
      for (const [ingredientId, deductionAmount] of stockDeductions.entries()) {
        await tx.outletIngredient.upsert({
          where: {
            outletId_ingredientId: {
              outletId: scopedOutletId,
              ingredientId: ingredientId,
            },
          },
          update: {
            stockQuantity: { decrement: deductionAmount },
          },
          create: {
            outletId: scopedOutletId,
            ingredientId: ingredientId,
            stockQuantity: -deductionAmount,
          },
        });

        await tx.inventoryLog.create({
          data: {
            ingredientId,
            outletId: scopedOutletId,
            type: 'SALE',
            quantity: deductionAmount,
            notes: source === 'PUBLIC_QR' ? 'Sold from QR order' : 'Sold in POS',
            createdBy: userId ?? 'PUBLIC_QR',
          }
        });
      }

      // 5. Calculate total amount and build transaction items
      let totalAmount = 0;
      const transactionItems = items.map((orderItem) => {
        const menu = menus.find((m) => m.id === orderItem.menuId)!;
        const override = menu.outletMenus[0];
        const priceAtSale = override ? Number(override.sellingPrice) : Number(menu.sellingPrice);
        const subtotal = priceAtSale * orderItem.quantity;
        totalAmount += subtotal;

        return {
          menuId: orderItem.menuId,
          quantity: orderItem.quantity,
          priceAtSale,
          subtotal,
          notes: orderItem.notes,
          modifiers: orderItem.modifiers || null,
        };
      });
      
      const pricing = calculatePricing(totalAmount, discountAmount || 0, {
        taxEnabled,
        taxRate: Number.isFinite(parsedTaxRate) ? parsedTaxRate : 10,
        taxInclusive,
        roundingMode,
        roundingStep: Number.isFinite(parsedRoundingStep) ? Math.max(0, parsedRoundingStep) : 0,
      });

      // 5.5 Generate orderNumber (e.g. SHN28052600001)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const countToday = await tx.transaction.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = String(today.getFullYear()).slice(-2);
      
      const seq = String(countToday + 1).padStart(5, '0');
      const orderNumber = `Order #SHN${day}${month}${year}${seq}`;

      // 6. Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          orderNumber,
          totalAmount: pricing.totalAmount,
          paymentMethod: paymentMethod ?? PaymentMethod.CASH,
          status: status ?? TransactionStatus.COMPLETED,
          source: source ?? 'POS',
          orderType: selectedOrderType,
          tableNumber: normalizedTableNumber,
          outletId: scopedOutletId,
          customerName: normalizedCustomerName,
          customerId,
          discountAmount: pricing.discountAmount,
          taxAmount: pricing.taxAmount,
          shiftId,
          userId,
          items: {
            create: transactionItems,
          },
        },
        include: {
          items: {
            include: {
              menu: true,
            },
          },
          user: {
            include: {
              outlet: true,
            },
          },
          customer: true,
          outlet: true,
        },
      });

      await this.settingsService.saveTransactionPricingMetadata(
        transaction.id,
        {
          subtotalBeforeDiscount: totalAmount,
          discountAmount: pricing.discountAmount,
          taxableAmount: pricing.taxableAmount,
          taxAmount: pricing.taxAmount,
          totalAmount: pricing.totalAmount,
          taxEnabled,
          taxRate: Number.isFinite(parsedTaxRate) ? parsedTaxRate : 10,
          taxInclusive,
          roundingMode,
          roundingStep: Number.isFinite(parsedRoundingStep) ? Math.max(0, parsedRoundingStep) : 0,
          roundingAdjustment: pricing.roundingAdjustment,
        },
        tx,
      );

      if (customerId && loyaltyEnabled) {
        const customer = await tx.customer.findUnique({
          where: { id: customerId },
          select: { pointBalance: true },
        });

        if (customer) {
          const earnedPoints = Math.floor(pricing.totalAmount / pointsPerSpend);
          const nextPointBalance = customer.pointBalance + earnedPoints;
          await tx.customer.update({
            where: { id: customerId },
            data: {
              pointBalance: nextPointBalance,
              tier: this.resolveCustomerTier(nextPointBalance, silverMinPoints, goldMinPoints),
            },
          });
        }
      }

      return {
        ...transaction,
        user: transaction.user ? sanitizeUser(transaction.user) : transaction.user,
        pricingMetadata: {
          subtotalBeforeDiscount: totalAmount,
          discountAmount: pricing.discountAmount,
          taxableAmount: pricing.taxableAmount,
          taxAmount: pricing.taxAmount,
          totalAmount: pricing.totalAmount,
          taxEnabled,
          taxRate: Number.isFinite(parsedTaxRate) ? parsedTaxRate : 10,
          taxInclusive,
          roundingMode,
          roundingStep: Number.isFinite(parsedRoundingStep) ? Math.max(0, parsedRoundingStep) : 0,
          roundingAdjustment: pricing.roundingAdjustment,
        },
      };
    });
    // Emit real-time new order event to KDS clients
    try { this.kdsGateway.emitNewOrder(createdTransaction); } catch {}
    return createdTransaction;
  }

  async findAll(user: AuthenticatedUser, outletId?: string) {
    const scopedOutletId = this.resolveScopedOutletId(user, outletId);
    const transactions = await this.prisma.transaction.findMany({
      where: scopedOutletId ? { outletId: scopedOutletId } : undefined,
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        user: {
          include: {
            outlet: true,
          },
        },
        shift: true,
        customer: true,
        outlet: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const withMetadata = await this.attachPricingMetadata(transactions);
    return withMetadata.map((transaction) => ({
      ...transaction,
      user: transaction.user ? sanitizeUser(transaction.user) : transaction.user,
    }));
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        user: {
          include: {
            outlet: true,
          },
        },
        shift: true,
        customer: true,
        outlet: true,
      },
    });
    if (!transaction) return transaction;
    this.assertTransactionAccess(user, transaction.outletId);
    const [withMetadata] = await this.attachPricingMetadata([transaction]);
    return {
      ...withMetadata,
      user: withMetadata.user ? sanitizeUser(withMetadata.user) : withMetadata.user,
    };
  }

  async voidTransaction(user: any, id: string, ip?: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menu: {
              include: {
                ingredients: true
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('Only completed transactions can be voided');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update status to CANCELLED
      const updatedTx = await tx.transaction.update({
        where: { id },
        data: { status: TransactionStatus.CANCELLED },
        include: {
          items: {
            include: { menu: true }
          },
          outlet: true,
        }
      });

      // 2. Restock ingredients and write VOID log
      for (const item of transaction.items) {
        if (!item.menu) continue;
        for (const recipeItem of item.menu.ingredients) {
          const quantityToRestore = recipeItem.quantity * item.quantity;
          
          if (transaction.outletId) {
            await tx.outletIngredient.upsert({
              where: {
                outletId_ingredientId: {
                  outletId: transaction.outletId,
                  ingredientId: recipeItem.ingredientId,
                },
              },
              update: {
                stockQuantity: { increment: quantityToRestore },
              },
              create: {
                outletId: transaction.outletId,
                ingredientId: recipeItem.ingredientId,
                stockQuantity: quantityToRestore,
              },
            });
          }

          await tx.inventoryLog.create({
            data: {
              ingredientId: recipeItem.ingredientId,
              outletId: transaction.outletId,
              type: 'VOID',
              quantity: quantityToRestore,
              notes: `Voided transaction ${transaction.orderNumber}`,
            }
          });
        }
      }

      const [withMetadata] = await this.attachPricingMetadata([updatedTx]);
      return withMetadata;
    });
  }

  async updateKitchenStatus(
    user: AuthenticatedUser,
    id: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE',
  ) {
    const existingTransaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!existingTransaction) throw new BadRequestException('Transaction not found');
    this.assertTransactionAccess(user, existingTransaction.outletId);
    
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: { kitchenStatus: status as any },
      include: {
        items: {
          include: { menu: true },
        },
        user: {
          include: {
            outlet: true,
          },
        },
        shift: true,
        customer: true,
        outlet: true,
      },
    });
    const [withMetadata] = await this.attachPricingMetadata([updatedTransaction]);
    const result = {
      ...withMetadata,
      user: withMetadata.user ? sanitizeUser(withMetadata.user) : withMetadata.user,
    };
    // Emit real-time update to KDS clients
    try { this.kdsGateway.emitOrderUpdated(result); } catch {}
    return result;
  }

  private async attachPricingMetadata<T extends { id: string }>(transactions: T[]) {
    const metadataMap = await this.settingsService.getTransactionPricingMetadataMap(transactions.map((transaction) => transaction.id));
    return transactions.map((transaction) => ({
      ...transaction,
      pricingMetadata: metadataMap.get(transaction.id) ?? null,
    }));
  }

  private resolveCustomerTier(
    pointBalance: number,
    silverMinPoints: number,
    goldMinPoints: number,
  ): CustomerTier {
    if (pointBalance >= goldMinPoints) return CustomerTier.GOLD;
    if (pointBalance >= silverMinPoints) return CustomerTier.SILVER;
    return CustomerTier.BRONZE;
  }

  private resolveScopedOutletId(
    user: AuthenticatedUser | null,
    requestedOutletId?: string,
    source?: string,
  ) {
    if (!user) {
      return requestedOutletId;
    }

    if (user.role === Role.OWNER) {
      return requestedOutletId;
    }

    if (requestedOutletId && user.outletId && requestedOutletId !== user.outletId) {
      throw new BadRequestException('You do not have access to this outlet');
    }

    if (source !== 'PUBLIC_QR' && user.outletId) {
      return requestedOutletId ?? user.outletId;
    }

    return requestedOutletId ?? user.outletId ?? undefined;
  }

  private assertTransactionAccess(user: AuthenticatedUser, outletId?: string | null) {
    if (user.role === Role.OWNER) {
      return;
    }

    if (user.outletId && outletId && outletId !== user.outletId) {
      throw new BadRequestException('You do not have access to this transaction');
    }
  }
}
