import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { DatabaseModule } from './database/database.module';
import { ServiceConfigModule } from '@rentease/common';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ServiceConfigModule,
        DatabaseModule,
        TenantModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
