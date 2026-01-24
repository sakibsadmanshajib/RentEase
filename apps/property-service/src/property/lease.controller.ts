import { Controller, Get, Post, Body, Param, Query, Patch, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { JwtAuthGuard, RequireOrgGuard, OrgId } from '@rentease/auth';

@Controller('leases')
@UseGuards(JwtAuthGuard, RequireOrgGuard)
export class LeaseController {
    constructor(private readonly leaseService: LeaseService) { }

    @Post()
    create(@Body() createLeaseDto: CreateLeaseDto) {
        return this.leaseService.create(createLeaseDto);
    }

    @Get()
    findAll(@OrgId() orgId: string, @Query('unitId') unitId?: string) {
        return this.leaseService.findAll(orgId, unitId);
    }

    @Get(':id')
    async findOne(@OrgId() orgId: string, @Param('id') id: string) {
        return this.leaseService.findOneForOrg(id, orgId);
    }

    @Post(':id/activate')
    async activate(@OrgId() orgId: string, @Param('id') id: string) {
        return this.leaseService.activate(id, orgId);
    }

    @Post(':id/terminate')
    async terminate(@OrgId() orgId: string, @Param('id') id: string) {
        return this.leaseService.terminate(id, orgId);
    }

    @Post(':id/occupants')
    async addOccupant(
        @OrgId() orgId: string,
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        return this.leaseService.addOccupant(id, userId, orgId);
    }

    @Patch(':id')
    async update(@OrgId() orgId: string, @Param('id') id: string, @Body() updateLeaseDto: any) {
        return this.leaseService.update(id, updateLeaseDto, orgId);
    }

    @Delete(':id')
    async remove(@OrgId() orgId: string, @Param('id') id: string) {
        await this.leaseService.remove(id, orgId);
        return { message: 'Lease deleted successfully' };
    }
}
