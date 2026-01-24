import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { InternalUsersController } from './internal-users.controller';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { UserOrganizationMembership } from './models/user-tenant-membership.model';
import { Role } from './models/role.model';
import { UserRole } from './models/user-role.model';
import { Permission } from './models/permission.model';
import { RolePermission } from './models/role-permission.model';
import { ServiceAuthGuard } from '../auth/service-auth.guard';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Role, Permission, UserOrganizationMembership]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '60m' },
            }),
            inject: [ConfigService],
        }),
        forwardRef(() => AuthModule),
        ConfigModule,
    ],
    controllers: [UsersController, InternalUsersController],
    providers: [UsersService, ServiceAuthGuard],
    exports: [UsersService, SequelizeModule],
})
export class UsersModule { }


