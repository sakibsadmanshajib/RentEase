import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Property, Unit, Lease, LeaseOccupant } from '../property/models/all.models';
// import { Tenant } from '../tenant/models/tenant.model';

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
