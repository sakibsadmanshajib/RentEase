import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Invoice } from '../billing/models/invoice.model';
import { LedgerAccount } from '../billing/models/ledger-account.model';
import { LedgerEntry } from '../billing/models/ledger-entry.model';
import { Payment } from '../billing/models/payment.model';
import { Expense } from '../billing/models/expense.model';

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
            models: [Invoice, LedgerAccount, LedgerEntry, Payment, Expense],
        }),
    ],
})
export class DatabaseModule { }
