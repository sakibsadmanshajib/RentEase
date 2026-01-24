import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Guard that ensures the request has organization context from JWT.
 * Use alongside JwtAuthGuard to protect endpoints that require org isolation.
 * 
 * @example
 * @UseGuards(JwtAuthGuard, RequireOrgGuard)
 * @Controller('invoices')
 * export class InvoiceController {}
 */
@Injectable()
export class RequireOrgGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const orgId = request.user?.orgId || request.user?.tenantId;
        
        if (!orgId) {
            throw new ForbiddenException('Organization context required');
        }
        
        return true;
    }
}
