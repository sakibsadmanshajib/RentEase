import { Controller, Get, Post, Body, Param, Query, Patch, Delete, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leases')
@UseGuards(JwtAuthGuard)
export class LeaseController {
    constructor(private readonly leaseService: LeaseService) { }

    @Post()
    create(@Body() createLeaseDto: CreateLeaseDto) {
        return this.leaseService.create(createLeaseDto);
    }

    @Get()
    findAll(@Request() req: any, @Query('unitId') unitId?: string) {
        const tenantId = req.user?.tenantId;
        return this.leaseService.findAll(tenantId, unitId);
    }

    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user?.tenantId;
        if (tenantId) {
            return this.leaseService.findOneForTenant(id, tenantId);
        }
        const lease = await this.leaseService.findOne(id);
        if (!lease) {
            throw new NotFoundException(`Lease with ID ${id} not found`);
        }
        return lease;
    }

    @Post(':id/activate')
    async activate(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user?.tenantId;
        return this.leaseService.activate(id, tenantId);
    }

    @Post(':id/terminate')
    async terminate(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user?.tenantId;
        return this.leaseService.terminate(id, tenantId);
    }

    @Post(':id/occupants')
    async addOccupant(
        @Request() req: any,
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        const tenantId = req.user?.tenantId;
        return this.leaseService.addOccupant(id, userId, tenantId);
    }

    @Patch(':id')
    async update(@Request() req: any, @Param('id') id: string, @Body() updateLeaseDto: any) {
        const tenantId = req.user?.tenantId;
        return this.leaseService.update(id, updateLeaseDto, tenantId);
    }

    @Delete(':id')
    async remove(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user?.tenantId;
        await this.leaseService.remove(id, tenantId);
        return { message: 'Lease deleted successfully' };
    }
}
