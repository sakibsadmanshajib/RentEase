import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) { }

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
        const tenantId = request.headers['x-tenant-id'];

        if (!user) {
            return false;
        }

        // TODO: In a real app, we should fetch the user with roles/permissions from the DB here
        // or ensure they are present in the JWT payload.
        // For this implementation, we will assume the user object attached to the request
        // (populated by JwtStrategy) contains the necessary info or we fetch it here.

        // Since JwtStrategy usually just decodes the token, we might need to fetch the user from DB
        // to get the latest roles/permissions.
        // However, to keep it simple for now, let's assume we need to fetch it.
        // But we don't have access to a UserService here easily unless we inject it.

        // Let's assume the user object has:
        // user.roles = ['admin'] (Global roles)
        // user.tenantMemberships = [{ tenantId: '...', role: { name: 'manager', permissions: [...] } }]

        // For now, let's implement the logic assuming we have the data.

        // 1. Check Global Roles
        if (user.roles?.some((role: any) => requiredRoles.includes(role.name || role))) {
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
