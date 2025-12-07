import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards, Req, Headers } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './models/property.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('properties')
export class PropertyController {
    constructor(private readonly propertyService: PropertyService) { }

    @Post()
    create(@Body() createPropertyDto: CreatePropertyDto) {
        return this.propertyService.create(createPropertyDto);
    }

    /**
     * List properties - uses tenant from JWT if authenticated, otherwise returns all (for backward compat)
     */
    @Get()
    findAll(@Req() req: any, @Headers('Authorization') authHeader?: string) {
        // If authenticated via JWT, filter by tenant
        const tenantId = req.user?.tenantId;
        return this.propertyService.findAll(tenantId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any) {
        const tenantId = req.user?.tenantId;
        
        // If authenticated and has tenant, validate access
        if (tenantId) {
            return this.propertyService.findOneForTenant(id, tenantId);
        }
        
        // Backward compatibility: no auth = no filtering
        const property = await this.propertyService.findOne(id);
        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }
        return property;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto, @Req() req: any) {
        const tenantId = req.user?.tenantId;
        const [affectedCount, updatedProperties] = await this.propertyService.update(id, updatePropertyDto, tenantId);
        if (affectedCount === 0) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }
        return updatedProperties[0];
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        const tenantId = req.user?.tenantId;
        
        // Validate existence (and ownership if tenantId present)
        if (tenantId) {
            await this.propertyService.findOneForTenant(id, tenantId);
        } else {
            const property = await this.propertyService.findOne(id);
            if (!property) {
                throw new NotFoundException(`Property with ID ${id} not found`);
            }
        }
        
        await this.propertyService.remove(id, tenantId);
        return { message: 'Property deleted successfully' };
    }
}

