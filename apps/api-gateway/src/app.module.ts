import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { LeaseController } from './lease.controller';
import { PropertyController } from './property.controller';
import { BillingController } from './billing.controller';

import { TenantController } from './tenant.controller';

@Module({
    imports: [HttpModule],
    controllers: [AuthController, LeaseController, PropertyController, BillingController, TenantController],
    providers: [],
})
export class AppModule { }
