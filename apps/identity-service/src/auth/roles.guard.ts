import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RolesGuard implements CanActivate {
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
        const user = request.user;
        const tenantId = this.cls.get('TENANT_ID');

        if (!user) {
            return false;
        }

        // 1. Check Global Roles
        if (user.roles?.some((role: any) => requiredRoles.includes(role.name))) {
            return true;
        }

        // 2. Check Tenant Roles if tenantId is present
        if (tenantId && user.tenantMemberships) {
            const membership = user.tenantMemberships.find((m: any) => m.tenantId === tenantId);
            if (membership && membership.role && requiredRoles.includes(membership.role.name)) {
                return true;
            }
        }

        return false;
    }
}
