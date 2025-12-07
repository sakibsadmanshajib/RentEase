import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './models/property.model';

@Controller('properties')
export class PropertyController {
    constructor(private readonly propertyService: PropertyService) { }

    @Post()
    create(@Body() createPropertyDto: CreatePropertyDto) {
        return this.propertyService.create(createPropertyDto);
    }

    @Get()
    findAll() {
        return this.propertyService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const property = await this.propertyService.findOne(id);
        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }
        return property;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
        const [affectedCount, updatedProperties] = await this.propertyService.update(id, updatePropertyDto);
        if (affectedCount === 0) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }
        return updatedProperties[0];
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const property = await this.propertyService.findOne(id);
        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }
        await this.propertyService.remove(id);
        return { message: 'Property deleted successfully' };
    }
}
