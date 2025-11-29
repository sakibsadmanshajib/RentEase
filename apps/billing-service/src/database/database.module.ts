import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Invoice } from '../billing/models/invoice.model';

@Module({
    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'password',
            database: 'rentease',
            autoLoadModels: true,
            synchronize: true,
            models: [Invoice],
        }),
    ],
})
export class DatabaseModule { }
