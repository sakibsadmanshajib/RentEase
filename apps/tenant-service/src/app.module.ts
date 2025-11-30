import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        TenantModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
