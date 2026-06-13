
import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@rentease/auth';
import { MigrationService } from './database/migration.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OrganizationContextInterceptor } from '@rentease/common';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            // Load service's own .env file (process.cwd() = service dir)
            envFilePath: '.env',
        }),
        DatabaseModule,
        TenantModule,
        AuthModule,
    ],
    controllers: [],
    providers: [
        MigrationService,
        {
            provide: APP_INTERCEPTOR,
            useClass: OrganizationContextInterceptor,
        },
    ],
})
export class AppModule { }

