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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditInterceptor = class AuditInterceptor {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const method = req.method;
        if (['GET', 'OPTIONS', 'HEAD'].includes(method)) {
            return next.handle();
        }
        const start = Date.now();
        return next.handle().pipe((0, operators_1.tap)(() => {
            const user = req.user;
            const target = req.originalUrl || req.url;
            let action = 'UNKNOWN';
            if (method === 'POST')
                action = 'CREATE';
            else if (method === 'PATCH' || method === 'PUT')
                action = 'UPDATE';
            else if (method === 'DELETE')
                action = 'DELETE';
            if (target.includes('/auth/login'))
                action = 'LOGIN';
            if (target.includes('/auth/logout'))
                action = 'LOGOUT';
            if (target.includes('/transactions') && target.endsWith('/void'))
                action = 'VOID_TRANSACTION';
            if (target.includes('/transactions') && target.endsWith('/kitchen'))
                action = 'UPDATE_KITCHEN_STATUS';
            if (target.includes('/settings') && target.includes('/apply-log-retention'))
                action = 'APPLY_LOG_RETENTION';
            if (target.includes('/settings') && target.includes('/reset-demo-data'))
                action = 'RESET_DEMO_DATA';
            if (target.includes('/settings') && target.includes('/restore-backup'))
                action = 'RESTORE_BACKUP';
            let bodyDetails = null;
            if (req.body) {
                const safeBody = { ...req.body };
                if (safeBody.password)
                    safeBody.password = '***MASKED***';
                if (safeBody.newPassword)
                    safeBody.newPassword = '***MASKED***';
                if (safeBody.oldPassword)
                    safeBody.oldPassword = '***MASKED***';
                bodyDetails = JSON.stringify(safeBody);
            }
            let finalDetails = `Time taken: ${Date.now() - start}ms`;
            if (bodyDetails && bodyDetails.length < 1000) {
                finalDetails += `\nPayload: ${bodyDetails}`;
            }
            else if (bodyDetails) {
                finalDetails += `\nPayload: (Too large to log)`;
            }
            this.prisma.auditLog.create({
                data: {
                    userId: user?.id,
                    userEmail: user?.email,
                    userName: user?.name,
                    action,
                    target,
                    details: finalDetails,
                    ipAddress: req.ip,
                },
            }).catch(err => console.error('Failed to write audit log from interceptor:', err));
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map