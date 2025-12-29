import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

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
    providers: [],
})
export class AppModule { }
