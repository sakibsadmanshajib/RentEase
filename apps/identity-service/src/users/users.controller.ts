import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@Req() req: any) {
        return req.user;
    }

    @Post(':userId/tenants')
    async addMembership(
        @Param('userId') userId: string,
        @Body() createMembershipDto: CreateMembershipDto,
    ) {
        return this.usersService.addMembership(userId, createMembershipDto);
    }

    @Get(':userId/tenants')
    async getMemberships(@Param('userId') userId: string) {
        return this.usersService.getMemberships(userId);
    }
}
