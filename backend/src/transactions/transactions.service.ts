import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { items, status, paymentMethod, orderType, tableNumber, discountAmount, taxAmount, shiftId, customerName, customerId } = createTransactionDto;

    return this.prisma.$transaction(async (tx) => {
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
        if (ingredient.stockQuantity < deductionAmount) {
          throw new BadRequestException(
            `Insufficient stock for ingredient: ${ingredient.name}. ` +
            `Available: ${ingredient.stockQuantity} ${ingredient.unit}, ` +
            `Required: ${deductionAmount} ${ingredient.unit}`,
          );
        }
      }

      // 4. Deduct stock for each ingredient and write InventoryLog
      for (const [ingredientId, deductionAmount] of stockDeductions.entries()) {
        await tx.ingredient.update({
          where: { id: ingredientId },
          data: {
            stockQuantity: { decrement: deductionAmount },
          },
        });
        await tx.inventoryLog.create({
          data: {
            ingredientId,
            type: 'SALE',
            quantity: deductionAmount,
            notes: `Sold in POS`,
            createdBy: userId,
          }
        });
      }

      // 5. Calculate total amount and build transaction items
      let totalAmount = 0;
      const transactionItems = items.map((orderItem) => {
        const menu = menus.find((m) => m.id === orderItem.menuId)!;
        const priceAtSale = Number(menu.sellingPrice);
        const subtotal = priceAtSale * orderItem.quantity;
        totalAmount += subtotal;

        return {
          menuId: orderItem.menuId,
          quantity: orderItem.quantity,
          priceAtSale,
          subtotal,
          notes: orderItem.notes,
        };
      });
      
      if (discountAmount && discountAmount > 0) {
        totalAmount = Math.max(0, totalAmount - discountAmount);
      }

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
          totalAmount,
          paymentMethod: paymentMethod ?? PaymentMethod.CASH,
          status: status ?? TransactionStatus.COMPLETED,
          orderType: orderType || 'DINE_IN',
          tableNumber,
          customerName,
          customerId,
          discountAmount: discountAmount || 0,
          taxAmount: taxAmount || 0,
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
          user: true,
          customer: true,
        },
      });

      if (customerId) {
        // Add points (1 point per 10k)
        const earnedPoints = Math.floor(totalAmount / 10000);
        await tx.customer.update({
          where: { id: customerId },
          data: { pointBalance: { increment: earnedPoints } }
        });
      }

      return transaction;
    });
  }

  findAll() {
    return this.prisma.transaction.findMany({
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        user: true,
        shift: true,
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        user: true,
        shift: true,
        customer: true,
      },
    });
  }

  async voidTransaction(id: string) {
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
          }
        }
      });

      // 2. Restock ingredients and write VOID log
      for (const item of transaction.items) {
        for (const recipeItem of item.menu.ingredients) {
          const quantityToRestore = recipeItem.quantity * item.quantity;
          
          await tx.ingredient.update({
            where: { id: recipeItem.ingredientId },
            data: {
              stockQuantity: {
                increment: quantityToRestore
              }
            }
          });

          await tx.inventoryLog.create({
            data: {
              ingredientId: recipeItem.ingredientId,
              type: 'VOID',
              quantity: quantityToRestore,
              notes: `Voided transaction ${transaction.orderNumber}`,
            }
          });
        }
      }

      return updatedTx;
    });
  }

  async updateKitchenStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'DONE') {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new BadRequestException('Transaction not found');
    
    return this.prisma.transaction.update({
      where: { id },
      data: { kitchenStatus: status as any },
      include: {
        items: {
          include: { menu: true },
        },
        user: true,
        shift: true,
      },
    });
  }
}
