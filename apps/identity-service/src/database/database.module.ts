import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { Role } from '../users/models/role.model';
import { UserRole } from '../users/models/user-role.model';
import { Permission } from '../users/models/permission.model';
import { RolePermission } from '../users/models/role-permission.model';
import { UserTenantMembership } from '../users/models/user-tenant-membership.model';

@Module({
    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'password',
            database: 'rentease', // TODO: Use separate DB or schema if needed, for now using same DB
            autoLoadModels: true,
            synchronize: true, // TODO: Disable in production
            models: [User, Role, UserRole, Permission, RolePermission, UserTenantMembership],
        }),
    ],
})
export class DatabaseModule { }
