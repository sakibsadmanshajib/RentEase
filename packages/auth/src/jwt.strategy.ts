import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
    email: string;
    sub: string;
    tenantId?: string;
    roles?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });

        if (!configService.get<string>('JWT_SECRET')) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
    }

    async validate(payload: JwtPayload) {
        if (!payload.sub) {
            throw new UnauthorizedException('Invalid token');
        }

        // Return user context with tenant info from JWT
        return {
            id: payload.sub,
            email: payload.email,
            tenantId: payload.tenantId,
            roles: payload.roles || [],
        };
    }
}
