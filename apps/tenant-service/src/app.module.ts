import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { DatabaseModule } from './database/database.module';

import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        DatabaseModule,
        TenantModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
