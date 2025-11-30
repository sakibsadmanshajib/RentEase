import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
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
    findOne(@Param('id') id: string) {
        return this.leaseService.findOne(id);
    }

    @Post(':id/activate')
    activate(@Param('id') id: string) {
        return this.leaseService.activate(id);
    }

    @Post(':id/terminate')
    terminate(@Param('id') id: string) {
        return this.leaseService.terminate(id);
    }

    @Post(':id/occupants')
    addOccupant(
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        return this.leaseService.addOccupant(id, userId);
    }
}
