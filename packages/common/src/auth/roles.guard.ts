import { Injectable, CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';

export const ROLES_KEY = 'roles';

/**
 * Factory function to create a RolesGuard class.
 * This allows each service to instantiate the guard with its own DI context.
 * 
 * Usage in a service's module:
 * ```typescript
 * import { createRolesGuard } from '@rentease/common';
 * 
 * const RolesGuard = createRolesGuard();
 * 
 * @Module({
 *   providers: [RolesGuard],
 * })
 * export class AppModule {}
 * ```
 */
export function createRolesGuard(): Type<CanActivate> {
    @Injectable()
    class RolesGuard implements CanActivate {
        constructor(
            private reflector: Reflector,
            private jwtService: JwtService,
            private readonly cls: ClsService,
        ) { }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (!requiredRoles) {
                return true;
            }

            const request = context.switchToHttp().getRequest();
            const token = this.extractTokenFromHeader(request);

            if (!token) {
                return false;
            }

            try {
                const payload = await this.jwtService.verifyAsync(token);
                const tenantId = this.cls.get('TENANT_ID');

                // Check global roles
                if (payload.roles) {
                    const hasGlobalRole = requiredRoles.some((role) =>
                        payload.roles?.includes(role),
                    );
                    if (hasGlobalRole) {
                        return true;
                    }
                }

                // Check tenant-specific roles
                if (tenantId && payload.tenantRoles) {
                    const tenantRoles = payload.tenantRoles[tenantId] || [];
                    return requiredRoles.some((role) => tenantRoles.includes(role));
                }

                return false;
            } catch {
                return false;
            }
        }

        private extractTokenFromHeader(request: any): string | undefined {
            const [type, token] = request.headers.authorization?.split(' ') ?? [];
            return type === 'Bearer' ? token : undefined;
        }
    }

    return RolesGuard;
}
