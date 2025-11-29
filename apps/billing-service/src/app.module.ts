import { Module } from '@nestjs/common';
import { BillingModule } from './billing/billing.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [DatabaseModule, BillingModule],
    controllers: [],
    providers: [],
})
export class AppModule { }
