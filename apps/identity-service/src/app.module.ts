import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { UsersModule } from './users/users.module';

import { MigrationService, MIGRATIONS_PATH } from './database/migration.service';
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            // Load service's own .env file (process.cwd() = service dir)
            envFilePath: '.env',
        }),
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
                setup: (cls, req) => {
                    cls.set('TENANT_ID', req.headers['x-tenant-id']);
                },
            },
        }),
        DatabaseModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [],
    providers: [
        MigrationService,
        {
            provide: MIGRATIONS_PATH,
            useValue: path.join(process.cwd(), 'dist/database/migrations/*.js'),
        },
    ],
})
export class AppModule { }
