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
exports.InventoryLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryLogsService = class InventoryLogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const ingredient = await this.prisma.ingredient.findUnique({ where: { id: data.ingredientId } });
        if (!ingredient)
            throw new common_1.BadRequestException('Ingredient not found');
        let newStock = Number(ingredient.stockQuantity);
        if (data.type === 'IN') {
            newStock += data.quantity;
        }
        else if (data.type === 'OUT' || data.type === 'SALE' || data.type === 'VOID') {
            if (data.type === 'VOID')
                newStock += data.quantity;
            else
                newStock -= data.quantity;
        }
        else if (data.type === 'ADJUSTMENT') {
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
};
exports.InventoryLogsService = InventoryLogsService;
exports.InventoryLogsService = InventoryLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryLogsService);
//# sourceMappingURL=inventory-logs.service.js.map