import { Controller, Get, Post, Body, Param, Query, Patch, Delete, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { JwtAuthGuard } from '@rentease/auth';

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
        const orgId = req.user?.orgId || req.user?.tenantId;
        return this.leaseService.findAll(orgId, unitId);
    }

    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        const orgId = req.user?.orgId || req.user?.tenantId;
        if (orgId) {
            return this.leaseService.findOneForOrg(id, orgId);
        }
        const lease = await this.leaseService.findOne(id);
        if (!lease) {
            throw new NotFoundException(`Lease with ID ${id} not found`);
        }
        return lease;
    }

    @Post(':id/activate')
    async activate(@Request() req: any, @Param('id') id: string) {
        const orgId = req.user?.orgId || req.user?.tenantId;
        return this.leaseService.activate(id, orgId);
    }

    @Post(':id/terminate')
    async terminate(@Request() req: any, @Param('id') id: string) {
        const orgId = req.user?.orgId || req.user?.tenantId;
        return this.leaseService.terminate(id, orgId);
    }

    @Post(':id/occupants')
    async addOccupant(
        @Request() req: any,
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        const orgId = req.user?.orgId || req.user?.tenantId;
        return this.leaseService.addOccupant(id, userId, orgId);
    }

    @Patch(':id')
    async update(@Request() req: any, @Param('id') id: string, @Body() updateLeaseDto: any) {
        const orgId = req.user?.orgId || req.user?.tenantId;
        return this.leaseService.update(id, updateLeaseDto, orgId);
    }

    @Delete(':id')
    async remove(@Request() req: any, @Param('id') id: string) {
        const orgId = req.user?.orgId || req.user?.tenantId;
        await this.leaseService.remove(id, orgId);
        return { message: 'Lease deleted successfully' };
    }
}
