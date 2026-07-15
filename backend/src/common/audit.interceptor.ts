import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    // Only log mutating actions
    const method = req.method;
    if (['GET', 'OPTIONS', 'HEAD'].includes(method)) {
      return next.handle();
    }

    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        // Log asynchronously after the request succeeds
        const user = req.user;
        const target = req.originalUrl || req.url;
        
        let action = 'UNKNOWN';
        if (method === 'POST') action = 'CREATE';
        else if (method === 'PATCH' || method === 'PUT') action = 'UPDATE';
        else if (method === 'DELETE') action = 'DELETE';

        // Custom action overrides based on URL for better readability
        if (target.includes('/auth/login')) action = 'LOGIN';
        if (target.includes('/auth/logout')) action = 'LOGOUT';
        if (target.includes('/transactions') && target.endsWith('/void')) action = 'VOID_TRANSACTION';
        if (target.includes('/transactions') && target.endsWith('/kitchen')) action = 'UPDATE_KITCHEN_STATUS';
        if (target.includes('/settings') && target.includes('/apply-log-retention')) action = 'APPLY_LOG_RETENTION';
        if (target.includes('/settings') && target.includes('/reset-demo-data')) action = 'RESET_DEMO_DATA';
        if (target.includes('/settings') && target.includes('/restore-backup')) action = 'RESTORE_BACKUP';
        
        // Build details payload
        let bodyDetails: string | null = null;
        if (req.body) {
          // Clone body to avoid mutating actual request
          const safeBody = { ...req.body };
          if (safeBody.password) safeBody.password = '***MASKED***';
          if (safeBody.newPassword) safeBody.newPassword = '***MASKED***';
          if (safeBody.oldPassword) safeBody.oldPassword = '***MASKED***';
          bodyDetails = JSON.stringify(safeBody);
        }
        
        let finalDetails = `Time taken: ${Date.now() - start}ms`;
        if (bodyDetails && bodyDetails.length < 1000) {
          finalDetails += `\nPayload: ${bodyDetails}`;
        } else if (bodyDetails) {
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
      }),
    );
  }
}
