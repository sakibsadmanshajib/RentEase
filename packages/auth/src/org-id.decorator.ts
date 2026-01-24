import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator that extracts the organization ID from the JWT user.
 * Use with RequireOrgGuard to ensure orgId is always present.
 * 
 * @example
 * @Get()
 * findAll(@OrgId() orgId: string) {
 *     return this.service.findAll(orgId);
 * }
 */
export const OrgId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.orgId || request.user?.tenantId;
    },
);
