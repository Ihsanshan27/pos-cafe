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
exports.PublicOrderRateLimitGuard = exports.LoginRateLimitGuard = exports.SimpleRateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
let SimpleRateLimitGuard = class SimpleRateLimitGuard {
    limit;
    windowMs;
    keyPrefix;
    buckets = new Map();
    constructor(limit = 10, windowMs = 60_000, keyPrefix = 'default') {
        this.limit = limit;
        this.windowMs = windowMs;
        this.keyPrefix = keyPrefix;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const now = Date.now();
        const ip = request.ip ||
            request.headers['x-forwarded-for'] ||
            request.socket?.remoteAddress ||
            'unknown';
        const bucketKey = `${this.keyPrefix}:${String(ip)}`;
        const existing = this.buckets.get(bucketKey);
        if (!existing || existing.resetAt <= now) {
            this.buckets.set(bucketKey, {
                count: 1,
                resetAt: now + this.windowMs,
            });
            return true;
        }
        if (existing.count >= this.limit) {
            throw new common_1.HttpException('Too many requests. Please wait a moment and try again.', 429);
        }
        existing.count += 1;
        this.buckets.set(bucketKey, existing);
        return true;
    }
};
exports.SimpleRateLimitGuard = SimpleRateLimitGuard;
exports.SimpleRateLimitGuard = SimpleRateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, Object])
], SimpleRateLimitGuard);
let LoginRateLimitGuard = class LoginRateLimitGuard extends SimpleRateLimitGuard {
    constructor() {
        super(30, 60_000, 'auth-login');
    }
};
exports.LoginRateLimitGuard = LoginRateLimitGuard;
exports.LoginRateLimitGuard = LoginRateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoginRateLimitGuard);
let PublicOrderRateLimitGuard = class PublicOrderRateLimitGuard extends SimpleRateLimitGuard {
    constructor() {
        super(20, 60_000, 'public-order');
    }
};
exports.PublicOrderRateLimitGuard = PublicOrderRateLimitGuard;
exports.PublicOrderRateLimitGuard = PublicOrderRateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PublicOrderRateLimitGuard);
//# sourceMappingURL=simple-rate-limit.guard.js.map