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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("./mail.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let MailController = class MailController {
    mailService;
    prisma;
    constructor(mailService, prisma) {
        this.mailService = mailService;
        this.prisma = prisma;
    }
    async sendBroadcast(req, dto) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'MANAGER') {
            throw new common_1.BadRequestException('Only Owner and Manager can send broadcasts');
        }
        if (!dto.subject || !dto.message || !dto.target) {
            throw new common_1.BadRequestException('Subject, message, and target are required');
        }
        let targetEmails = [];
        if (dto.target === 'USERS') {
            const users = await this.prisma.user.findMany({
                where: { email: { not: '' } },
                select: { email: true }
            });
            targetEmails = users.map(u => u.email).filter(Boolean);
        }
        else if (dto.target === 'CUSTOMERS') {
            const customers = await this.prisma.customer.findMany({
                where: { email: { not: null } },
                select: { email: true }
            });
            targetEmails = customers.map(c => c.email).filter(Boolean);
        }
        if (targetEmails.length === 0) {
            throw new common_1.BadRequestException('No emails found for the selected target');
        }
        await this.mailService.sendBroadcastEmail(dto.subject, dto.message, targetEmails);
        return { success: true, message: `Broadcast sent to ${targetEmails.length} recipients` };
    }
};
exports.MailController = MailController;
__decorate([
    (0, common_1.Post)('broadcast'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MailController.prototype, "sendBroadcast", null);
exports.MailController = MailController = __decorate([
    (0, common_1.Controller)('mail'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mail_service_1.MailService,
        prisma_service_1.PrismaService])
], MailController);
//# sourceMappingURL=mail.controller.js.map