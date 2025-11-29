import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [DatabaseModule, TenantModule],
    controllers: [],
    providers: [],
})
export class AppModule { }
