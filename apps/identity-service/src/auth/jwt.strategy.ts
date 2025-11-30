import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { Role } from '../users/models/role.model';
import { Permission } from '../users/models/permission.model';
import { UserTenantMembership } from '../users/models/user-tenant-membership.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'secretKey', // TODO: Use env variable
        });
    }

    async validate(payload: any) {
        const user = await this.userModel.findByPk(payload.sub, {
            include: [
                {
                    model: Role,
                    include: [Permission],
                },
                {
                    model: UserTenantMembership,
                    include: [
                        {
                            model: Role,
                            include: [Permission],
                        },
                    ],
                },
            ],
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        // Flatten permissions for easier access in Guard if needed, 
        // but Guard logic currently accesses user.roles and user.tenantMemberships directly.
        // We return the full user object.
        return user;
    }
}
