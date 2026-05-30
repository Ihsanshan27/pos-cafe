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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenusService = class MenusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMenuDto) {
        const { ingredients, ...menuData } = createMenuDto;
        return this.prisma.menu.create({
            data: {
                ...menuData,
                ingredients: {
                    create: ingredients?.map((item) => ({
                        quantity: item.quantity,
                        ingredientId: item.ingredientId,
                    })) || [],
                },
            },
            include: {
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
    }
    async findAll() {
        const menus = await this.prisma.menu.findMany({
            include: {
                category: true,
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
        return menus.map((menu) => {
            const hpp = menu.ingredients.reduce((total, recipeItem) => {
                const cost = Number(recipeItem.ingredient.costPerUnit) * recipeItem.quantity;
                return total + cost;
            }, 0);
            return { ...menu, hpp };
        });
    }
    async findOne(id) {
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                category: true,
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
        if (!menu)
            return null;
        const hpp = menu.ingredients.reduce((total, recipeItem) => {
            const cost = Number(recipeItem.ingredient.costPerUnit) * recipeItem.quantity;
            return total + cost;
        }, 0);
        return { ...menu, hpp };
    }
    async update(id, updateMenuDto) {
        const { ingredients, ...menuData } = updateMenuDto;
        return this.prisma.$transaction(async (tx) => {
            if (ingredients) {
                await tx.recipeItem.deleteMany({
                    where: { menuId: id },
                });
            }
            return tx.menu.update({
                where: { id },
                data: {
                    ...menuData,
                    ...(ingredients && {
                        ingredients: {
                            create: ingredients.map((item) => ({
                                quantity: item.quantity,
                                ingredientId: item.ingredientId,
                            })),
                        },
                    }),
                },
                include: {
                    ingredients: {
                        include: {
                            ingredient: true,
                        },
                    },
                },
            });
        });
    }
    remove(id) {
        return this.prisma.menu.delete({
            where: { id },
        });
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map