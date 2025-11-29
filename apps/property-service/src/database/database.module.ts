import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Property } from '../property/models/property.model';
import { Lease } from '../property/models/lease.model';

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
            models: [Property, Lease],
        }),
    ],
})
export class DatabaseModule { }
