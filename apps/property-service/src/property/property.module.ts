import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { Property, Unit, Lease, LeaseOccupant } from './models/all.models';

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
