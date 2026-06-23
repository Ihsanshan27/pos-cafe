import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class SimpleRateLimitGuard implements CanActivate {
    private readonly limit;
    private readonly windowMs;
    private readonly keyPrefix;
    private readonly buckets;
    constructor(limit?: number, windowMs?: number, keyPrefix?: string);
    canActivate(context: ExecutionContext): boolean;
}
export declare class LoginRateLimitGuard extends SimpleRateLimitGuard {
    constructor();
}
export declare class PublicOrderRateLimitGuard extends SimpleRateLimitGuard {
    constructor();
}
