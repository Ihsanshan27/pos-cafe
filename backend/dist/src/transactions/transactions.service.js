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
const settings_service_1 = require("../settings/settings.service");
const pricing_util_1 = require("./pricing.util");
const user_response_util_1 = require("../common/user-response.util");
let TransactionsService = class TransactionsService {
    prisma;
    settingsService;
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    async create(user, createTransactionDto) {
        const { items, status, paymentMethod, orderType, tableNumber, discountAmount, shiftId, customerName, customerId, outletId, source, } = createTransactionDto;
        const userId = user?.id ?? null;
        const scopedOutletId = this.resolveScopedOutletId(user, outletId, source);
        const [requireTableNumberSetting, requireCustomerNameSetting, enabledPaymentMethodsSetting, taxEnabledSetting, taxRateSetting, taxInclusiveSetting, roundingModeSetting, roundingStepSetting, lowStockThresholdSetting, blockSaleOnLowStockSetting, loyaltyEnabledSetting, pointsPerSpendSetting, silverMinPointsSetting, goldMinPointsSetting,] = await Promise.all([
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
            }
            catch {
                return ['CASH', 'QRIS', 'DEBIT', 'EWALLET'];
            }
        })();
        const taxEnabled = taxEnabledSetting?.value === 'true';
        const parsedTaxRate = Number(taxRateSetting?.value ?? '10');
        const taxInclusive = taxInclusiveSetting?.value === 'true';
        const roundingMode = roundingModeSetting?.value === 'UP' ||
            roundingModeSetting?.value === 'DOWN' ||
            roundingModeSetting?.value === 'NEAREST'
            ? roundingModeSetting.value
            : 'NONE';
        const parsedRoundingStep = Number(roundingStepSetting?.value ?? '0');
        const lowStockThreshold = Math.max(0, Number(lowStockThresholdSetting?.value ?? '10'));
        const blockSaleOnLowStock = blockSaleOnLowStockSetting?.value === 'true';
        const loyaltyEnabled = loyaltyEnabledSetting?.value !== 'false';
        const pointsPerSpend = Math.max(1, Number(pointsPerSpendSetting?.value ?? '10000'));
        const silverMinPoints = Math.max(0, Number(silverMinPointsSetting?.value ?? '100'));
        const goldMinPoints = Math.max(silverMinPoints, Number(goldMinPointsSetting?.value ?? '300'));
        if (requireTableNumber && selectedOrderType === 'DINE_IN' && !normalizedTableNumber) {
            throw new common_1.BadRequestException('Table number is required for dine in orders');
        }
        if (requireCustomerName && selectedOrderType === 'TAKEAWAY' && !customerId && !normalizedCustomerName) {
            throw new common_1.BadRequestException('Customer name is required for takeaway orders');
        }
        if (paymentMethod && !enabledPaymentMethods.includes(paymentMethod)) {
            throw new common_1.BadRequestException(`Payment method ${paymentMethod} is currently disabled`);
        }
        return this.prisma.$transaction(async (tx) => {
            if (scopedOutletId) {
                const outlet = await tx.outlet.findUnique({ where: { id: scopedOutletId } });
                if (!outlet || !outlet.isActive) {
                    throw new common_1.BadRequestException('Outlet not found or inactive');
                }
            }
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
                if (blockSaleOnLowStock && ingredient.stockQuantity - deductionAmount < lowStockThreshold) {
                    throw new common_1.BadRequestException(`Stock ${ingredient.name} would fall below minimum threshold (${lowStockThreshold} ${ingredient.unit})`);
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
                        notes: source === 'PUBLIC_QR' ? 'Sold from QR order' : 'Sold in POS',
                        createdBy: userId ?? 'PUBLIC_QR',
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
            const pricing = (0, pricing_util_1.calculatePricing)(totalAmount, discountAmount || 0, {
                taxEnabled,
                taxRate: Number.isFinite(parsedTaxRate) ? parsedTaxRate : 10,
                taxInclusive,
                roundingMode,
                roundingStep: Number.isFinite(parsedRoundingStep) ? Math.max(0, parsedRoundingStep) : 0,
            });
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
                    totalAmount: pricing.totalAmount,
                    paymentMethod: paymentMethod ?? client_1.PaymentMethod.CASH,
                    status: status ?? client_1.TransactionStatus.COMPLETED,
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
            await this.settingsService.saveTransactionPricingMetadata(transaction.id, {
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
            }, tx);
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
                user: transaction.user ? (0, user_response_util_1.sanitizeUser)(transaction.user) : transaction.user,
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
    }
    async findAll(user, outletId) {
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
            user: transaction.user ? (0, user_response_util_1.sanitizeUser)(transaction.user) : transaction.user,
        }));
    }
    async findOne(user, id) {
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
        if (!transaction)
            return transaction;
        this.assertTransactionAccess(user, transaction.outletId);
        const [withMetadata] = await this.attachPricingMetadata([transaction]);
        return {
            ...withMetadata,
            user: withMetadata.user ? (0, user_response_util_1.sanitizeUser)(withMetadata.user) : withMetadata.user,
        };
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
                    },
                    outlet: true,
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
            const [withMetadata] = await this.attachPricingMetadata([updatedTx]);
            return withMetadata;
        });
    }
    async updateKitchenStatus(user, id, status) {
        const existingTransaction = await this.prisma.transaction.findUnique({ where: { id } });
        if (!existingTransaction)
            throw new common_1.BadRequestException('Transaction not found');
        this.assertTransactionAccess(user, existingTransaction.outletId);
        const updatedTransaction = await this.prisma.transaction.update({
            where: { id },
            data: { kitchenStatus: status },
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
        return {
            ...withMetadata,
            user: withMetadata.user ? (0, user_response_util_1.sanitizeUser)(withMetadata.user) : withMetadata.user,
        };
    }
    async attachPricingMetadata(transactions) {
        const metadataMap = await this.settingsService.getTransactionPricingMetadataMap(transactions.map((transaction) => transaction.id));
        return transactions.map((transaction) => ({
            ...transaction,
            pricingMetadata: metadataMap.get(transaction.id) ?? null,
        }));
    }
    resolveCustomerTier(pointBalance, silverMinPoints, goldMinPoints) {
        if (pointBalance >= goldMinPoints)
            return client_1.CustomerTier.GOLD;
        if (pointBalance >= silverMinPoints)
            return client_1.CustomerTier.SILVER;
        return client_1.CustomerTier.BRONZE;
    }
    resolveScopedOutletId(user, requestedOutletId, source) {
        if (!user) {
            return requestedOutletId;
        }
        if (user.role === client_1.Role.OWNER) {
            return requestedOutletId;
        }
        if (requestedOutletId && user.outletId && requestedOutletId !== user.outletId) {
            throw new common_1.BadRequestException('You do not have access to this outlet');
        }
        if (source !== 'PUBLIC_QR' && user.outletId) {
            return requestedOutletId ?? user.outletId;
        }
        return requestedOutletId ?? user.outletId ?? undefined;
    }
    assertTransactionAccess(user, outletId) {
        if (user.role === client_1.Role.OWNER) {
            return;
        }
        if (user.outletId && outletId && outletId !== user.outletId) {
            throw new common_1.BadRequestException('You do not have access to this transaction');
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map