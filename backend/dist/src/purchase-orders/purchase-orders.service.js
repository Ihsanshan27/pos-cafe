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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PurchaseOrdersService = class PurchaseOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        if (!data.items?.length) {
            throw new common_1.BadRequestException('Purchase order items are required');
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
    findAll(outletId) {
        return this.prisma.purchaseOrder.findMany({
            where: outletId ? { outletId } : undefined,
            include: this.defaultInclude(),
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: this.defaultInclude(),
        });
    }
    updateStatus(id, userId, status, receivedQuantities) {
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
            if (!purchaseOrder)
                throw new common_1.BadRequestException('Purchase order not found');
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
    defaultInclude() {
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
        };
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map