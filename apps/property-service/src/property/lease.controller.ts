import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { CreateLeaseDto } from './dto/create-lease.dto';

@Controller('leases')
export class LeaseController {
    constructor(private readonly leaseService: LeaseService) { }

    @Post()
    create(@Body() createLeaseDto: CreateLeaseDto) {
        return this.leaseService.create(createLeaseDto);
    }

    @Get()
    findAll() {
        return this.leaseService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leaseService.findOne(id);
    }

    @Get('tenant/:tenantId')
    findByTenant(@Param('tenantId') tenantId: string) {
        return this.leaseService.findByTenant(tenantId);
    }
}
