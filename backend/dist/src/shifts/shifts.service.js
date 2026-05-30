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
exports.ShiftsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ShiftsService = class ShiftsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createShiftDto) {
        const activeShift = await this.prisma.shift.findFirst({
            where: { userId, status: 'OPEN' },
        });
        if (activeShift)
            throw new common_1.BadRequestException('You already have an open shift');
        return this.prisma.shift.create({
            data: {
                userId,
                startingCash: createShiftDto.startingCash,
            },
        });
    }
    findAll() {
        return this.prisma.shift.findMany({
            include: { user: true },
            orderBy: { startTime: 'desc' }
        });
    }
    findActive(userId) {
        return this.prisma.shift.findFirst({
            where: { userId, status: 'OPEN' },
        });
    }
    findOne(id) {
        return this.prisma.shift.findUnique({ where: { id }, include: { transactions: true } });
    }
    async update(id, updateShiftDto) {
        return this.prisma.shift.update({
            where: { id },
            data: {
                ...updateShiftDto,
                endTime: updateShiftDto.status === 'CLOSED' ? new Date() : undefined,
            },
        });
    }
};
exports.ShiftsService = ShiftsService;
exports.ShiftsService = ShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShiftsService);
//# sourceMappingURL=shifts.service.js.map