import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { Unit } from './models/all.models';

@Controller('units')
export class UnitController {
    constructor(private readonly unitService: UnitService) { }

    @Post()
    create(@Body() createUnitDto: CreateUnitDto) {
        return this.unitService.create(createUnitDto);
    }

    @Get('property/:propertyId')
    findAll(@Param('propertyId') propertyId: string) {
        return this.unitService.findAll(propertyId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.unitService.findOne(id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.unitService.updateStatus(id, status);
    }
}
