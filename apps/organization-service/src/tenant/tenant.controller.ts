import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '@rentease/auth';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Request() req: any, @Body() createTenantDto: CreateTenantDto) {
        // userId used for membership invitation logic
        return this.tenantService.create(createTenantDto, req.user.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.tenantService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const tenant = await this.tenantService.findOne(id);
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        return tenant;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
        const tenant = await this.tenantService.findOne(id);
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        const [affectedCount, updatedTenants] = await this.tenantService.update(id, updateTenantDto);
        if (affectedCount === 0) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        return updatedTenants[0];
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const tenant = await this.tenantService.findOne(id);
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        await this.tenantService.remove(id);
        return { message: 'Tenant deleted successfully' };
    }

    @Post(':id/invitations')
    async createInvitation(
        @Param('id') id: string,
        @Body('email') email: string,
        @Body('roleId') roleId: string,
    ) {
        const tenant = await this.tenantService.findOne(id);
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        return this.tenantService.createInvitation(id, email, roleId);
    }

    @Post(':id/suspend')
    async suspend(@Param('id') id: string) {
        const tenant = await this.tenantService.findOne(id);
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        return this.tenantService.suspend(id);
    }

    @Post(':id/activate')
    async activate(@Param('id') id: string) {
        const tenant = await this.tenantService.findOne(id);
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
        return this.tenantService.activate(id);
    }

    @Post('invitations/:token/accept')
    @UseGuards(JwtAuthGuard)
    acceptInvitation(
        @Param('token') token: string,
        @Request() req: any,
    ) {
        return this.tenantService.acceptInvitation(token, req.user.id);
    }
}
