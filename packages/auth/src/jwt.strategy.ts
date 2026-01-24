import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
    email: string;
    sub: string;
    orgId?: string; // New Standard
    tenantId?: string; // Legacy support during migration
    roles?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload.sub) {
            throw new UnauthorizedException('Invalid token');
        }

        // Standardize on orgId
        const user = {
            id: payload.sub,
            email: payload.email,
            orgId: payload.orgId || payload.tenantId,
            tenantId: payload.tenantId || payload.orgId, // Backward compatibility
            roles: payload.roles || [],
        };
        console.log(`DEBUG: JwtStrategy validated user: ${user.email}, orgId: ${user.orgId}`);
        return user;
    }
}
