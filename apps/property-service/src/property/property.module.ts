import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Property } from './models/property.model';
import { Unit } from './models/unit.model';
import { Lease } from './models/lease.model';
import { LeaseOccupant } from './models/lease-occupant.model';

import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { LeaseController } from './lease.controller';
import { LeaseService } from './lease.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Property, Unit, Lease, LeaseOccupant]),
    ],
    controllers: [PropertyController, UnitController, LeaseController],
    providers: [PropertyService, UnitService, LeaseService],
})
export class PropertyModule { }
