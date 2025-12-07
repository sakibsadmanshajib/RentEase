import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMembershipDto } from './dto/create-membership.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@Req() req: any) {
        return req.user;
    }

    @Patch('me')
    async updateProfile(@Req() req: any, @Body() updateData: any) {
        return this.usersService.updateUser(req.user.id, updateData);
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
