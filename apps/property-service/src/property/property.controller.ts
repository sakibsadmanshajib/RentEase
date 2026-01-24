import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard, RequireOrgGuard, OrgId } from '@rentease/auth';

@Controller('properties')
@UseGuards(JwtAuthGuard, RequireOrgGuard)
export class PropertyController {
    constructor(private readonly propertyService: PropertyService) { }

    @Post()
    async create(@Body() createPropertyDto: CreatePropertyDto) {
        try {
            return await this.propertyService.create(createPropertyDto);
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    }

    /**
     * List properties - uses org from JWT
     */
    @Get()
    async findAll(@OrgId() orgId: string) {
        try {
            return await this.propertyService.findAll(orgId);
        } catch (error) {
            console.error('Error finding properties:', error);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @OrgId() orgId: string) {
        try {
            return await this.propertyService.findOneForOrg(id, orgId);
        } catch (error) {
            console.error('Error finding property:', error);
            throw error;
        }
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto, @OrgId() orgId: string) {
        try {
            const [affectedCount, updatedProperties] = await this.propertyService.update(id, updatePropertyDto, orgId);
            if (affectedCount === 0) {
                throw new NotFoundException(`Property with ID ${id} not found`);
            }
            return updatedProperties[0];
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @OrgId() orgId: string) {
        try {
            await this.propertyService.findOneForOrg(id, orgId);
            
            await this.propertyService.remove(id, orgId);
            return { message: 'Property deleted successfully' };
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    }
}
