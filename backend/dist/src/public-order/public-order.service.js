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
exports.PublicOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const outlets_service_1 = require("../outlets/outlets.service");
const transactions_service_1 = require("../transactions/transactions.service");
let PublicOrderService = class PublicOrderService {
    prisma;
    outletsService;
    transactionsService;
    constructor(prisma, outletsService, transactionsService) {
        this.prisma = prisma;
        this.outletsService = outletsService;
        this.transactionsService = transactionsService;
    }
    async getMenu(outletSlug, tableCode) {
        const outlet = await this.outletsService.findPublicOutletTable(outletSlug, tableCode);
        const [menus, categories] = await Promise.all([
            this.prisma.menu.findMany({
                include: {
                    category: true,
                    ingredients: {
                        include: {
                            ingredient: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
        ]);
        return {
            outlet: {
                id: outlet.id,
                name: outlet.name,
                slug: outlet.slug,
                address: outlet.address,
                phone: outlet.phone,
            },
            table: outlet.tableQRCodes[0],
            categories,
            menus,
        };
    }
    async createOrder(outletSlug, tableCode, data) {
        const outlet = await this.outletsService.findPublicOutletTable(outletSlug, tableCode);
        return this.transactionsService.create(null, {
            items: data.items,
            customerName: data.customerName?.trim(),
            orderType: 'DINE_IN',
            tableNumber: outlet.tableQRCodes[0].label || outlet.tableQRCodes[0].code,
            outletId: outlet.id,
            source: 'PUBLIC_QR',
            status: 'PENDING',
            paymentMethod: 'CASH',
        });
    }
};
exports.PublicOrderService = PublicOrderService;
exports.PublicOrderService = PublicOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        outlets_service_1.OutletsService,
        transactions_service_1.TransactionsService])
], PublicOrderService);
//# sourceMappingURL=public-order.service.js.map