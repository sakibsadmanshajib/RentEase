import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { Property } from './models/property.model';
import { Lease } from './models/lease.model';
import { LeaseController } from './lease.controller';
import { LeaseService } from './lease.service';

@Module({
    imports: [SequelizeModule.forFeature([Property, Lease])],
    controllers: [PropertyController, LeaseController],
    providers: [PropertyService, LeaseService],
})
export class PropertyModule { }
