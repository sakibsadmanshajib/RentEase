import { Module } from '@nestjs/common';
import { PropertyModule } from './property/property.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [DatabaseModule, PropertyModule],
    controllers: [],
    providers: [],
})
export class AppModule { }
