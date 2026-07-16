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
exports.IngredientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IngredientsService = class IngredientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createIngredientDto) {
        const { outletId, stockQuantity, ...ingredientData } = createIngredientDto;
        const ingredient = await this.prisma.ingredient.create({
            data: ingredientData,
        });
        const outlets = await this.prisma.outlet.findMany({ select: { id: true } });
        const initialStock = stockQuantity ?? 0;
        await this.prisma.outletIngredient.createMany({
            data: outlets.map((outlet) => ({
                outletId: outlet.id,
                ingredientId: ingredient.id,
                stockQuantity: outlet.id === outletId ? initialStock : 0,
            })),
        });
        return {
            ...ingredient,
            stockQuantity: initialStock,
        };
    }
    async findAll(outletId) {
        const ingredients = await this.prisma.ingredient.findMany({
            include: {
                outletStocks: outletId ? { where: { outletId } } : true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return ingredients.map((i) => {
            const { outletStocks, ...rest } = i;
            const stock = outletId
                ? (outletStocks[0]?.stockQuantity ?? 0)
                : outletStocks.reduce((sum, item) => sum + item.stockQuantity, 0);
            return {
                ...rest,
                stockQuantity: stock,
            };
        });
    }
    async findOne(id, outletId) {
        const ingredient = await this.prisma.ingredient.findUnique({
            where: { id },
            include: {
                outletStocks: outletId ? { where: { outletId } } : true,
            },
        });
        if (!ingredient)
            return null;
        const { outletStocks, ...rest } = ingredient;
        const stock = outletId
            ? (outletStocks[0]?.stockQuantity ?? 0)
            : outletStocks.reduce((sum, item) => sum + item.stockQuantity, 0);
        return {
            ...rest,
            stockQuantity: stock,
        };
    }
    async update(id, updateIngredientDto) {
        const { outletId, stockQuantity, ...ingredientData } = updateIngredientDto;
        const ingredient = await this.prisma.ingredient.update({
            where: { id },
            data: ingredientData,
        });
        if (outletId && stockQuantity !== undefined) {
            await this.prisma.outletIngredient.upsert({
                where: {
                    outletId_ingredientId: {
                        outletId,
                        ingredientId: id,
                    },
                },
                update: { stockQuantity },
                create: {
                    outletId,
                    ingredientId: id,
                    stockQuantity,
                },
            });
        }
        const currentStockRecord = outletId
            ? await this.prisma.outletIngredient.findUnique({
                where: {
                    outletId_ingredientId: {
                        outletId,
                        ingredientId: id,
                    },
                },
            })
            : null;
        return {
            ...ingredient,
            stockQuantity: currentStockRecord?.stockQuantity ?? 0,
        };
    }
    remove(id) {
        return this.prisma.ingredient.delete({
            where: { id },
        });
    }
};
exports.IngredientsService = IngredientsService;
exports.IngredientsService = IngredientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IngredientsService);
//# sourceMappingURL=ingredients.service.js.map