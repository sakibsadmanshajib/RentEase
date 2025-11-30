import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Invoice } from './models/invoice.model';
import { LedgerAccount } from './models/ledger-account.model';
import { LedgerEntry } from './models/ledger-entry.model';
import { Payment } from './models/payment.model';
import { Expense } from './models/expense.model';

@Module({
    imports: [
        SequelizeModule.forFeature([Invoice, LedgerAccount, LedgerEntry, Payment, Expense]),
        ScheduleModule.forRoot(),
    ],
    controllers: [BillingController],
    providers: [BillingService],
})
export class BillingModule { }
