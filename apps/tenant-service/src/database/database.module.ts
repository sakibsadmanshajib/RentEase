import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tenant } from '../tenant/models/tenant.model';

@Module({
    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'password',
            database: 'rentease', // TODO: Use separate DB or schema
            autoLoadModels: true,
            synchronize: true, // TODO: Disable in production
            models: [Tenant],
        }),
    ],
})
export class DatabaseModule { }
