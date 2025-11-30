import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

    @Post(':id/suspend')
    suspend(@Param('id') id: string) {
        return this.tenantService.suspend(id);
    }

    @Post(':id/activate')
    activate(@Param('id') id: string) {
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
