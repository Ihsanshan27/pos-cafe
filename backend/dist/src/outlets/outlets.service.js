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
exports.OutletsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OutletsService = class OutletsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.outlet.create({
            data: {
                name: data.name.trim(),
                slug: data.slug.trim().toLowerCase(),
                address: data.address?.trim(),
                phone: data.phone?.trim(),
                isActive: data.isActive ?? true,
            },
            include: { tableQRCodes: true },
        });
    }
    findAll() {
        return this.prisma.outlet.findMany({
            include: {
                tableQRCodes: true,
                _count: {
                    select: {
                        users: true,
                        transactions: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    findOne(id) {
        return this.prisma.outlet.findUnique({
            where: { id },
            include: { tableQRCodes: true },
        });
    }
    update(id, data) {
        return this.prisma.outlet.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name.trim() } : {}),
                ...(data.slug !== undefined ? { slug: data.slug.trim().toLowerCase() } : {}),
                ...(data.address !== undefined ? { address: data.address.trim() } : {}),
                ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
            include: { tableQRCodes: true },
        });
    }
    async remove(id) {
        return this.prisma.outlet.delete({ where: { id } });
    }
    createTableQr(outletId, data) {
        return this.prisma.tableQRCode.create({
            data: {
                outletId,
                code: data.code.trim().toUpperCase(),
                label: data.label?.trim(),
                isActive: data.isActive ?? true,
            },
        });
    }
    updateTableQr(id, data) {
        return this.prisma.tableQRCode.update({
            where: { id },
            data: {
                ...(data.code !== undefined ? { code: data.code.trim().toUpperCase() } : {}),
                ...(data.label !== undefined ? { label: data.label.trim() } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
        });
    }
    removeTableQr(id) {
        return this.prisma.tableQRCode.delete({ where: { id } });
    }
    async findPublicOutletTable(outletSlug, tableCode) {
        const outlet = await this.prisma.outlet.findUnique({
            where: { slug: outletSlug.toLowerCase() },
            include: {
                tableQRCodes: {
                    where: {
                        code: tableCode.toUpperCase(),
                        isActive: true,
                    },
                },
            },
        });
        if (!outlet || !outlet.isActive || outlet.tableQRCodes.length === 0) {
            throw new common_1.BadRequestException('Outlet or table QR not found');
        }
        return outlet;
    }
};
exports.OutletsService = OutletsService;
exports.OutletsService = OutletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OutletsService);
//# sourceMappingURL=outlets.service.js.map