import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { UserTenantMembership } from './models/user-tenant-membership.model';
import { Role } from './models/role.model';
import { UserRole } from './models/user-role.model';
import { Permission } from './models/permission.model';
import { RolePermission } from './models/role-permission.model';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            User,
            UserTenantMembership,
            Role,
            UserRole,
            Permission,
            RolePermission
        ]),
        forwardRef(() => AuthModule),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService, SequelizeModule],
})
export class UsersModule { }
