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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.supplier.create({
            data: {
                name: data.name.trim(),
                phone: data.phone?.trim(),
                email: data.email?.trim(),
                address: data.address?.trim(),
                notes: data.notes?.trim(),
                isActive: data.isActive ?? true,
            },
        });
    }
    findAll() {
        return this.prisma.supplier.findMany({
            include: {
                _count: {
                    select: { purchaseOrders: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    update(id, data) {
        return this.prisma.supplier.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name.trim() } : {}),
                ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
                ...(data.email !== undefined ? { email: data.email.trim() } : {}),
                ...(data.address !== undefined ? { address: data.address.trim() } : {}),
                ...(data.notes !== undefined ? { notes: data.notes.trim() } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
        });
    }
    remove(id) {
        return this.prisma.supplier.delete({ where: { id } });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map