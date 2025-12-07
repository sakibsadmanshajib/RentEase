import { Controller, Get, Post, Body, Param, Query, Patch, Delete, NotFoundException } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { Lease } from './models/lease.model';

@Controller('leases')
export class LeaseController {
    constructor(private readonly leaseService: LeaseService) { }

    @Post()
    create(@Body() createLeaseDto: CreateLeaseDto) {
        return this.leaseService.create(createLeaseDto);
    }

    @Get()
    findAll(@Query('unitId') unitId?: string) {
        return this.leaseService.findAll(unitId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const lease = await this.leaseService.findOne(id);
        if (!lease) {
            throw new NotFoundException(`Lease with ID ${id} not found`);
        }
        return lease;
    }

    @Post(':id/activate')
    async activate(@Param('id') id: string) {
        const lease = await this.leaseService.findOne(id);
        if (!lease) {
            throw new NotFoundException(`Lease with ID ${id} not found`);
        }
        return this.leaseService.activate(id);
    }

    @Post(':id/terminate')
    async terminate(@Param('id') id: string) {
        const lease = await this.leaseService.findOne(id);
        if (!lease) {
            throw new NotFoundException(`Lease with ID ${id} not found`);
        }
        return this.leaseService.terminate(id);
    }

    @Post(':id/occupants')
    async addOccupant(
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        const lease = await this.leaseService.findOne(id);
        if (!lease) {
            throw new NotFoundException(`Lease with ID ${id} not found`);
        }
        return this.leaseService.addOccupant(id, userId);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateLeaseDto: any) {
        const lease = await this.leaseService.findOne(id);
        if (!lease) {
            throw new NotFoundException(`Lease with ID ${id} not found`);
        }
        return this.leaseService.update(id, updateLeaseDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const lease = await this.leaseService.findOne(id);
        if (!lease) {
            throw new NotFoundException(`Lease with ID ${id} not found`);
        }
        await this.leaseService.remove(id);
        return { message: 'Lease deleted successfully' };
    }
}
