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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const express = __importStar(require("express"));
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const settings_service_1 = require("../settings/settings.service");
const simple_rate_limit_guard_1 = require("../common/simple-rate-limit.guard");
let AuthController = class AuthController {
    authService;
    settingsService;
    constructor(authService, settingsService) {
        this.authService = authService;
        this.settingsService = settingsService;
    }
    async requestRegisterOtp(email) {
        if (!email)
            throw new common_1.BadRequestException('Email is required');
        return this.authService.requestRegisterOtp(email);
    }
    async register(dto) {
        const allowed = await this.settingsService.getAllowRegistration();
        if (!allowed) {
            throw new common_1.BadRequestException('Registration is currently disabled by administrator');
        }
        if (!dto.otp)
            throw new common_1.BadRequestException('OTP is required');
        return this.authService.register(dto);
    }
    async requestForgotPasswordOtp(email) {
        if (!email)
            throw new common_1.BadRequestException('Email is required');
        return this.authService.requestForgotPasswordOtp(email);
    }
    async resetPassword(dto) {
        if (!dto.email || !dto.otp || !dto.newPassword) {
            throw new common_1.BadRequestException('Email, OTP, and newPassword are required');
        }
        return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
    }
    async login(dto, response) {
        const result = await this.authService.login(dto);
        const timeoutSetting = await this.settingsService.getSetting('SESSION_TIMEOUT_MINUTES');
        const timeoutMinutes = Number(timeoutSetting?.value ?? '120') || 120;
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: timeoutMinutes * 60 * 1000,
        });
        return result;
    }
    async logout(response) {
        response.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
        return { success: true };
    }
    getProfile(req) {
        return req.user;
    }
    updateProfile(req, data) {
        return this.authService.updateProfile(req.user.id, data);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(simple_rate_limit_guard_1.LoginRateLimitGuard),
    (0, common_1.Post)('register/request-otp'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestRegisterOtp", null);
__decorate([
    (0, common_1.UseGuards)(simple_rate_limit_guard_1.LoginRateLimitGuard),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(simple_rate_limit_guard_1.LoginRateLimitGuard),
    (0, common_1.Post)('forgot-password/request-otp'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestForgotPasswordOtp", null);
__decorate([
    (0, common_1.UseGuards)(simple_rate_limit_guard_1.LoginRateLimitGuard),
    (0, common_1.Post)('forgot-password/reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(simple_rate_limit_guard_1.LoginRateLimitGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        settings_service_1.SettingsService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map