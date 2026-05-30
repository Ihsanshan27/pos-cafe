"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createTransactionDto) {
        const { items, status, paymentMethod, orderType, tableNumber, discountAmount, taxAmount, shiftId, customerName, customerId } = createTransactionDto;
        return this.prisma.$transaction(async (tx) => {
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
                throw new common_1.BadRequestException('One or more menu items not found');
            }
            const stockDeductions = new Map();
            for (const orderItem of items) {
                const menu = menus.find((m) => m.id === orderItem.menuId);
                if (!menu)
                    throw new common_1.BadRequestException(`Menu ${orderItem.menuId} not found`);
                for (const recipeItem of menu.ingredients) {
                    const deductionKey = recipeItem.ingredientId;
                    const deductionAmount = recipeItem.quantity * orderItem.quantity;
                    stockDeductions.set(deductionKey, (stockDeductions.get(deductionKey) ?? 0) + deductionAmount);
                }
            }
            for (const [ingredientId, deductionAmount] of stockDeductions.entries()) {
                const ingredient = await tx.ingredient.findUnique({
                    where: { id: ingredientId },
                });
                if (!ingredient) {
                    throw new common_1.BadRequestException(`Ingredient ${ingredientId} not found`);
                }
                if (ingredient.stockQuantity < deductionAmount) {
                    throw new common_1.BadRequestException(`Insufficient stock for ingredient: ${ingredient.name}. ` +
                        `Available: ${ingredient.stockQuantity} ${ingredient.unit}, ` +
                        `Required: ${deductionAmount} ${ingredient.unit}`);
                }
            }
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
            let totalAmount = 0;
            const transactionItems = items.map((orderItem) => {
                const menu = menus.find((m) => m.id === orderItem.menuId);
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
            const transaction = await tx.transaction.create({
                data: {
                    orderNumber,
                    totalAmount,
                    paymentMethod: paymentMethod ?? client_1.PaymentMethod.CASH,
                    status: status ?? client_1.TransactionStatus.COMPLETED,
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
    findOne(id) {
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
    async voidTransaction(id) {
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
            throw new common_1.BadRequestException('Transaction not found');
        }
        if (transaction.status !== client_1.TransactionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Only completed transactions can be voided');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedTx = await tx.transaction.update({
                where: { id },
                data: { status: client_1.TransactionStatus.CANCELLED },
                include: {
                    items: {
                        include: { menu: true }
                    }
                }
            });
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
    async updateKitchenStatus(id, status) {
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });
        if (!transaction)
            throw new common_1.BadRequestException('Transaction not found');
        return this.prisma.transaction.update({
            where: { id },
            data: { kitchenStatus: status },
            include: {
                items: {
                    include: { menu: true },
                },
                user: true,
                shift: true,
            },
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map