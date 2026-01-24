import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tenant } from '../tenant/models/tenant.model';
import { Invitation } from '../tenant/models/invitation.model';
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
                models: [Tenant, Invitation],
            }),
        }),
    ],
    providers: [MigrationService],
    exports: [MigrationService],
})
export class DatabaseModule { }
