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
const settings_service_1 = require("../settings/settings.service");
let InventoryLogsService = class InventoryLogsService {
    prisma;
    settingsService;
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    async create(data) {
        const normalizedNotes = data.notes?.trim();
        const requireAdjustmentNoteSetting = await this.settingsService.getSetting('REQUIRE_ADJUSTMENT_NOTE');
        const requireAdjustmentNote = requireAdjustmentNoteSetting?.value !== 'false';
        if (data.type === 'ADJUSTMENT' && requireAdjustmentNote && !normalizedNotes) {
            throw new common_1.BadRequestException('Adjustment note is required');
        }
        const ingredient = await this.prisma.ingredient.findUnique({ where: { id: data.ingredientId } });
        if (!ingredient)
            throw new common_1.BadRequestException('Ingredient not found');
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
        if (newStock < 0) {
            throw new common_1.BadRequestException(`Stock for ${ingredient.name} cannot be negative`);
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
    findAll(outletId) {
        return this.prisma.inventoryLog.findMany({
            where: outletId ? { outletId } : undefined,
            include: { ingredient: true },
            orderBy: { createdAt: 'desc' },
        }).then(async (logs) => {
            const createdByIds = Array.from(new Set(logs
                .map((log) => log.createdBy)
                .filter((value) => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value))));
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
};
exports.InventoryLogsService = InventoryLogsService;
exports.InventoryLogsService = InventoryLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService])
], InventoryLogsService);
//# sourceMappingURL=inventory-logs.service.js.map