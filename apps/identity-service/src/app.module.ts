import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ClsModule } from 'nestjs-cls';
import { UsersModule } from './users/users.module';
import { ServiceConfigModule } from '@rentease/common';

@Module({
    imports: [
        ServiceConfigModule,
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
    providers: [],
})
export class AppModule { }
