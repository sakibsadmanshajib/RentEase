import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Property } from '../property/models/property.model';
import { Unit } from '../property/models/unit.model';
import { Lease } from '../property/models/lease.model';
import { LeaseOccupant } from '../property/models/lease-occupant.model';
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
