import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { Role } from '../users/models/role.model';
import { UserRole } from '../users/models/user-role.model';

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
            models: [User, Role, UserRole],
        }),
    ],
})
export class DatabaseModule { }
