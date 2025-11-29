import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Invoice } from './models/invoice.model';

@Module({
    imports: [SequelizeModule.forFeature([Invoice])],
    controllers: [BillingController],
    providers: [BillingService],
})
export class BillingModule { }
