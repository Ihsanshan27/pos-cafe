"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const settings_service_1 = require("../settings/settings.service");
const client_1 = require("@prisma/client");
const user_response_util_1 = require("../common/user-response.util");
const mail_service_1 = require("../mail/mail.service");
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
let AuthService = class AuthService {
    prisma;
    jwtService;
    settingsService;
    mailService;
    constructor(prisma, jwtService, settingsService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.settingsService = settingsService;
        this.mailService = mailService;
    }
    async requestRegisterOtp(email) {
        const exists = await this.prisma.user.findUnique({ where: { email } });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.otpVerification.create({
            data: { email, code: otp, expiresAt, type: 'REGISTER' },
        });
        await this.mailService.sendOTPEmail(email, otp);
        return { success: true, message: 'OTP sent to email' };
    }
    async register(dto) {
        const validOtp = await this.prisma.otpVerification.findFirst({
            where: { email: dto.email, code: dto.otp, type: 'REGISTER' },
            orderBy: { createdAt: 'desc' },
        });
        if (!validOtp || validOtp.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
                role: client_1.Role.CASHIER,
            },
            include: {
                outlet: true,
            },
        });
        await this.prisma.otpVerification.deleteMany({
            where: { email: dto.email, type: 'REGISTER' },
        });
        return {
            ...(0, user_response_util_1.sanitizeUser)(user),
            mustChangePassword: await this.settingsService.getForcePasswordChangeRequired(user.id),
        };
    }
    async requestForgotPasswordOtp(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.otpVerification.create({
            data: { email, code: otp, expiresAt, type: 'FORGOT_PASSWORD' },
        });
        await this.mailService.sendOTPEmail(email, otp);
        return { success: true, message: 'OTP sent to email' };
    }
    async resetPassword(email, otp, newPassword) {
        const validOtp = await this.prisma.otpVerification.findFirst({
            where: { email, code: otp, type: 'FORGOT_PASSWORD' },
            orderBy: { createdAt: 'desc' },
        });
        if (!validOtp || validOtp.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        await this.settingsService.markPasswordChanged(user.id);
        await this.prisma.otpVerification.deleteMany({
            where: { email, type: 'FORGOT_PASSWORD' },
        });
        return { success: true, message: 'Password has been reset' };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { outlet: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                ...(0, user_response_util_1.sanitizeUser)(user),
                mustChangePassword: await this.settingsService.getForcePasswordChangeRequired(user.id),
            },
        };
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        if (data.email && data.email !== user.email) {
            const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
            if (exists)
                throw new common_1.ConflictException('Email already in use');
        }
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.email)
            updateData.email = data.email;
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: { outlet: true },
        });
        if (data.password) {
            await this.settingsService.markPasswordChanged(userId);
        }
        return {
            ...(0, user_response_util_1.sanitizeUser)(updatedUser),
            mustChangePassword: await this.settingsService.getForcePasswordChangeRequired(userId),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        settings_service_1.SettingsService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map