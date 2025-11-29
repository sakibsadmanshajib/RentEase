import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { LeaseController } from './lease.controller';
import { PropertyController } from './property.controller';

@Module({
    imports: [HttpModule],
    controllers: [AuthController, LeaseController, PropertyController],
    providers: [],
})
export class AppModule { }
