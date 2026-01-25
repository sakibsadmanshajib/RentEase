import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // First try HTTP-only cookie (browser clients)
                (request: Request) => request?.cookies?.accessToken || null,
                // Fall back to Authorization header (API clients, testing)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });

        if (!configService.get<string>('JWT_SECRET')) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
    }

    async validate(payload: any) {
        // JWT payload already contains all needed info (sub, email, orgId, roles)
        // No need to query the database on every request
        if (!payload.sub) {
            throw new UnauthorizedException();
        }

        return {
            sub: payload.sub,
            id: payload.sub, // Alias for convenience
            email: payload.email,
            orgId: payload.orgId,
            roles: payload.roles || [],
        };
    }
}

