import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Property } from '../property/models/property.model';
import { Unit } from '../property/models/unit.model';
import { Lease } from '../property/models/lease.model';
import { LeaseOccupant } from '../property/models/lease-occupant.model';
import { MigrationService } from './migration.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
        }),
        SequelizeModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                dialect: 'postgres',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get('DB_PORT', 5432),
                username: configService.get('DB_USERNAME', 'postgres'),
                password: configService.get('DB_PASSWORD', 'password'),
                database: configService.get('DB_DATABASE', 'rentease'),
                autoLoadModels: true,
                synchronize: false, // Migration-based schema management
                models: [Property, Unit, Lease, LeaseOccupant], // FIXED: Added Unit and LeaseOccupant
            }),
        }),
    ],
    providers: [MigrationService],
    exports: [MigrationService],
})
export class DatabaseModule { }
