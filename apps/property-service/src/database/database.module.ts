import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Property } from '../property/models/property.model';
import { Unit } from '../property/models/unit.model';
import { Lease } from '../property/models/lease.model';
import { LeaseOccupant } from '../property/models/lease-occupant.model';

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
                models: [Property, Unit, Lease, LeaseOccupant],
            }),
        }),
    ],
    providers: [],
    exports: [SequelizeModule],
})
export class DatabaseModule { }
