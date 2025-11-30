import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { Role } from '../users/models/role.model';
import { UserRole } from '../users/models/user-role.model';
import { Permission } from '../users/models/permission.model';
import { RolePermission } from '../users/models/role-permission.model';
import { UserTenantMembership } from '../users/models/user-tenant-membership.model';
import { JwtStrategy } from './jwt.strategy';
@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'secretKey', // TODO: Use env variable
            signOptions: { expiresIn: '60s' },
        }),
        SequelizeModule.forFeature([User, Role, UserRole, Permission, RolePermission, UserTenantMembership]),
    ],
    controllers: [AuthController],
    providers: [AuthService, RolesGuard, JwtStrategy],
    exports: [AuthService, RolesGuard, JwtModule],
})
export class AuthModule { }
