import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    create(@Body() createTenantDto: CreateTenantDto) {
        return this.tenantService.create(createTenantDto);
    }

    @Get()
    findAll() {
        return this.tenantService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tenantService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
        return this.tenantService.update(id, updateTenantDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tenantService.remove(id);
    }

    @Post(':id/invitations')
    createInvitation(
        @Param('id') id: string,
        @Body('email') email: string,
        @Body('roleId') roleId: string,
    ) {
        return this.tenantService.createInvitation(id, email, roleId);
    }

    @Post('invitations/:token/accept')
    acceptInvitation(@Param('token') token: string) {
        return this.tenantService.acceptInvitation(token);
    }
}
