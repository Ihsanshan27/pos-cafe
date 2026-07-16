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
exports.ModifiersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ModifiersService = class ModifiersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.modifierGroup.create({
            data: {
                name: data.name,
                isRequired: data.isRequired ?? false,
                isMultiple: data.isMultiple ?? false,
                options: {
                    create: data.options.map(opt => ({
                        name: opt.name,
                        price: opt.price
                    }))
                }
            },
            include: {
                options: true
            }
        });
    }
    async findAll() {
        return this.prisma.modifierGroup.findMany({
            include: {
                options: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
    async findOne(id) {
        const group = await this.prisma.modifierGroup.findUnique({
            where: { id },
            include: { options: true }
        });
        if (!group)
            throw new common_1.NotFoundException('Modifier group not found');
        return group;
    }
    async update(id, data) {
        const group = await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            if (data.options) {
                await tx.modifierOption.deleteMany({
                    where: { groupId: id }
                });
            }
            return tx.modifierGroup.update({
                where: { id },
                data: {
                    name: data.name !== undefined ? data.name : group.name,
                    isRequired: data.isRequired !== undefined ? data.isRequired : group.isRequired,
                    isMultiple: data.isMultiple !== undefined ? data.isMultiple : group.isMultiple,
                    ...(data.options && {
                        options: {
                            create: data.options.map(opt => ({
                                name: opt.name,
                                price: opt.price
                            }))
                        }
                    })
                },
                include: {
                    options: true
                }
            });
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.modifierGroup.delete({
            where: { id }
        });
    }
};
exports.ModifiersService = ModifiersService;
exports.ModifiersService = ModifiersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModifiersService);
//# sourceMappingURL=modifiers.service.js.map