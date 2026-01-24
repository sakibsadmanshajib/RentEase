import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { Role } from '../users/models/role.model';
import { UserRole } from '../users/models/user-role.model';
import { Permission } from '../users/models/permission.model';
import { RolePermission } from '../users/models/role-permission.model';
import { UserOrganizationMembership } from '../users/models/user-tenant-membership.model';

@Module({
    imports: [
        ConfigModule,
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                dialect: 'postgres',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get('DB_PORT', 5432),
                username: configService.get('DB_USERNAME', 'postgres'),
                password: configService.get('DB_PASSWORD', 'password'),
                database: configService.get('DB_DATABASE', 'rentease'),
                autoLoadModels: true,
                synchronize: false,
                models: [User, Role, Permission, UserRole, RolePermission, UserOrganizationMembership],
                logging: false,
            }),
        }),
    ],
    providers: [],
    exports: [SequelizeModule],
})
export class DatabaseModule { }
