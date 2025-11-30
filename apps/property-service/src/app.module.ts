import { Module } from '@nestjs/common';
import { PropertyModule } from './property/property.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        PropertyModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
