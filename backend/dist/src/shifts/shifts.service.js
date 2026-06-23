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
const client_1 = require("@prisma/client");
const user_response_util_1 = require("../common/user-response.util");
let ShiftsService = class ShiftsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createShiftDto) {
        const activeShift = await this.prisma.shift.findFirst({
            where: { userId, status: 'OPEN', outletId: createShiftDto.outletId ?? undefined },
        });
        if (activeShift)
            throw new common_1.BadRequestException('You already have an open shift');
        return this.prisma.shift.create({
            data: {
                userId,
                startingCash: createShiftDto.startingCash,
                outletId: createShiftDto.outletId,
            },
        });
    }
    async findAll(user, outletId) {
        const scopedOutletId = this.resolveScopedOutletId(user, outletId);
        const where = user.role === client_1.Role.OWNER || user.role === client_1.Role.MANAGER
            ? scopedOutletId
                ? { outletId: scopedOutletId }
                : undefined
            : {
                userId: user.id,
                ...(scopedOutletId ? { outletId: scopedOutletId } : {}),
            };
        const shifts = await this.prisma.shift.findMany({
            where,
            include: {
                user: {
                    include: {
                        outlet: true,
                    },
                },
                outlet: true,
            },
            orderBy: { startTime: 'desc' },
        });
        return shifts.map((shift) => ({
            ...shift,
            user: (0, user_response_util_1.sanitizeUser)(shift.user),
        }));
    }
    findActive(user, outletId) {
        const scopedOutletId = this.resolveScopedOutletId(user, outletId);
        return this.prisma.shift.findFirst({
            where: { userId: user.id, status: 'OPEN', outletId: scopedOutletId ?? undefined },
        });
    }
    async findOne(user, id) {
        const shift = await this.prisma.shift.findUnique({
            where: { id },
            include: {
                transactions: true,
                user: {
                    include: {
                        outlet: true,
                    },
                },
                outlet: true,
            },
        });
        if (!shift)
            return shift;
        this.assertShiftAccess(user, shift.userId, shift.outletId);
        return {
            ...shift,
            user: (0, user_response_util_1.sanitizeUser)(shift.user),
        };
    }
    async update(user, id, updateShiftDto) {
        const existingShift = await this.prisma.shift.findUnique({ where: { id } });
        if (!existingShift) {
            throw new common_1.BadRequestException('Shift not found');
        }
        this.assertShiftAccess(user, existingShift.userId, existingShift.outletId);
        return this.prisma.shift.update({
            where: { id },
            data: {
                ...updateShiftDto,
                endTime: updateShiftDto.status === 'CLOSED' ? new Date() : undefined,
            },
        });
    }
    resolveScopedOutletId(user, requestedOutletId) {
        if (user.role === client_1.Role.OWNER || user.role === client_1.Role.MANAGER) {
            return requestedOutletId;
        }
        if (requestedOutletId && user.outletId && requestedOutletId !== user.outletId) {
            throw new common_1.BadRequestException('You do not have access to this outlet');
        }
        return requestedOutletId ?? user.outletId ?? undefined;
    }
    assertShiftAccess(user, shiftUserId, shiftOutletId) {
        if (user.role === client_1.Role.OWNER || user.role === client_1.Role.MANAGER) {
            if (user.role === client_1.Role.MANAGER && user.outletId && shiftOutletId && shiftOutletId !== user.outletId) {
                throw new common_1.BadRequestException('You do not have access to this shift');
            }
            return;
        }
        if (shiftUserId !== user.id) {
            throw new common_1.BadRequestException('You do not have access to this shift');
        }
        if (user.outletId && shiftOutletId && shiftOutletId !== user.outletId) {
            throw new common_1.BadRequestException('You do not have access to this shift');
        }
    }
};
exports.ShiftsService = ShiftsService;
exports.ShiftsService = ShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShiftsService);
//# sourceMappingURL=shifts.service.js.map