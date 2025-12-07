import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
// import { ScheduleModule } from '@nestjs/schedule'; // Temporarily disabled due to crypto issue
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
        // ScheduleModule.forRoot(), // Temporarily disabled due to crypto issue
    ],
    controllers: [BillingController],
    providers: [BillingService],
})
export class BillingModule { }
