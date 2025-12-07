import { Module } from '@nestjs/common';
import { PropertyModule } from './property/property.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AuthModule,
        PropertyModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

