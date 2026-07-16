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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const settings_service_1 = require("../settings/settings.service");
let CustomersService = class CustomersService {
    prisma;
    settingsService;
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    create(data) {
        return this.prisma.customer.create({ data });
    }
    async findAll() {
        const customers = await this.prisma.customer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return this.attachResolvedTier(customers);
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { transactions: true }
        });
        if (!customer)
            return customer;
        const [resolved] = await this.attachResolvedTier([customer]);
        return resolved;
    }
    async update(id, data) {
        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }
    remove(id) {
        return this.prisma.customer.delete({ where: { id } });
    }
    async attachResolvedTier(customers) {
        if (customers.length === 0)
            return customers;
        const [silverSetting, goldSetting] = await Promise.all([
            this.settingsService.getSetting('SILVER_MIN_POINTS'),
            this.settingsService.getSetting('GOLD_MIN_POINTS'),
        ]);
        const silverMinPoints = Math.max(0, Number(silverSetting?.value ?? '100'));
        const goldMinPoints = Math.max(silverMinPoints, Number(goldSetting?.value ?? '300'));
        return customers.map((customer) => ({
            ...customer,
            tier: this.resolveTier(customer.pointBalance, silverMinPoints, goldMinPoints),
        }));
    }
    resolveTier(pointBalance, silverMinPoints, goldMinPoints) {
        if (pointBalance >= goldMinPoints)
            return client_1.CustomerTier.GOLD;
        if (pointBalance >= silverMinPoints)
            return client_1.CustomerTier.SILVER;
        return client_1.CustomerTier.BRONZE;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map