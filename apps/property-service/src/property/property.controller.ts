import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, ForbiddenException, UseGuards, Req, Headers } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './models/property.model';
import { JwtAuthGuard } from '@rentease/auth';

@Controller('properties')
@UseGuards(JwtAuthGuard)
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
     * List properties - uses org from JWT if authenticated
     */
    @Get()
    async findAll(@Req() req: any, @Headers('Authorization') authHeader?: string) {
        try {
            // If authenticated via JWT, filter by org
            const orgId = req.user?.orgId || req.user?.tenantId;
            return await this.propertyService.findAll(orgId);
        } catch (error) {
            console.error('Error finding properties:', error);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any) {
        try {
            const orgId = req.user?.orgId || req.user?.tenantId;
            
            // If authenticated and has org, validate access
            if (orgId) {
                return await this.propertyService.findOneForOrg(id, orgId);
            }
            
            // Backward compatibility: no auth = no filtering
            const property = await this.propertyService.findOne(id);
            if (!property) {
                throw new NotFoundException(`Property with ID ${id} not found`);
            }
            return property;
        } catch (error) {
            console.error('Error finding property:', error);
            throw error;
        }
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto, @Req() req: any) {
        try {
            const orgId = req.user?.orgId || req.user?.tenantId;
            if (!orgId) {
                throw new ForbiddenException('Organization context required');
            }
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
    async remove(@Param('id') id: string, @Req() req: any) {
        try {
            const orgId = req.user?.orgId || req.user?.tenantId;
            if (!orgId) {
                throw new ForbiddenException('Organization context required');
            }
            await this.propertyService.findOneForOrg(id, orgId);
            
            await this.propertyService.remove(id, orgId);
            return { message: 'Property deleted successfully' };
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    }
}

