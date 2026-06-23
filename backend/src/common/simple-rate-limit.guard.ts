import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class SimpleRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitBucket>();

  constructor(
    private readonly limit = 10,
    private readonly windowMs = 60_000,
    private readonly keyPrefix = 'default',
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    const ip =
      request.ip ||
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
      throw new HttpException(
        'Too many requests. Please wait a moment and try again.',
        429,
      );
    }

    existing.count += 1;
    this.buckets.set(bucketKey, existing);
    return true;
  }
}

@Injectable()
export class LoginRateLimitGuard extends SimpleRateLimitGuard {
  constructor() {
    super(5, 60_000, 'auth-login');
  }
}

@Injectable()
export class PublicOrderRateLimitGuard extends SimpleRateLimitGuard {
  constructor() {
    super(20, 60_000, 'public-order');
  }
}
