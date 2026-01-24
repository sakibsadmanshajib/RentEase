import { Module } from '@nestjs/common';
import { BillingModule } from './billing/billing.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@rentease/auth';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OrganizationContextInterceptor } from '@rentease/common';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AuthModule,
        BillingModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: OrganizationContextInterceptor,
        },
    ],
})
export class AppModule { }
