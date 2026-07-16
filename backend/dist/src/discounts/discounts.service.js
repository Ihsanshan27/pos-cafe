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
exports.DiscountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DiscountsService = class DiscountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDiscountDto) {
        const exists = await this.prisma.discount.findUnique({ where: { code: createDiscountDto.code } });
        if (exists)
            throw new common_1.BadRequestException('Discount code already exists');
        return this.prisma.discount.create({ data: createDiscountDto });
    }
    findAll() {
        return this.prisma.discount.findMany();
    }
    findOne(id) {
        return this.prisma.discount.findUnique({ where: { id } });
    }
    update(id, updateDiscountDto) {
        return this.prisma.discount.update({
            where: { id },
            data: updateDiscountDto,
        });
    }
    remove(id) {
        return this.prisma.discount.delete({ where: { id } });
    }
};
exports.DiscountsService = DiscountsService;
exports.DiscountsService = DiscountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiscountsService);
//# sourceMappingURL=discounts.service.js.map