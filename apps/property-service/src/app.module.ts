
import { Module } from '@nestjs/common';
import { PropertyModule } from './property/property.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OrganizationContextInterceptor } from '@rentease/common';
import { AuthModule } from '@rentease/auth';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        PropertyModule,
        DatabaseModule,
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
