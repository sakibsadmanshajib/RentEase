import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { ServiceAuthGuard } from '../auth/service-auth.guard';

/**
 * Internal controller for service-to-service communication.
 * Protected by ServiceAuthGuard (X-Service-Token header).
 */
@Controller('internal/users')
@UseGuards(ServiceAuthGuard)
export class InternalUsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post(':userId/tenants')
    async addMembership(
        @Param('userId') userId: string,
        @Body() createMembershipDto: CreateMembershipDto,
    ) {
        return this.usersService.addMembership(userId, createMembershipDto);
    }
}
