import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Invoice } from '../billing/models/invoice.model';
import { LedgerAccount } from '../billing/models/ledger-account.model';
import { LedgerEntry } from '../billing/models/ledger-entry.model';
import { Payment } from '../billing/models/payment.model';
import { Expense } from '../billing/models/expense.model';
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
                models: [Invoice, LedgerAccount, LedgerEntry, Payment, Expense],
            }),
        }),
    ],
    providers: [MigrationService],
    exports: [MigrationService],
})
export class DatabaseModule { }
