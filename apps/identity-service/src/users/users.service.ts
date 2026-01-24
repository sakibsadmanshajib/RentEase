import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserOrganizationMembership } from './models/user-tenant-membership.model';
import { CreateMembershipDto } from './dto/create-membership.dto';
// However, since we are in Identity Service, we shouldn't import from Tenant Service directly if they are separate.
// But wait, the architecture said "No direct cross-DB joins".
// For this MVP, we are assuming we just store the ID. We won't validate Tenant existence here unless we make an API call or have a shared library.
// Let's just trust the ID for now or assume the caller (Tenant Service) validated it.

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(UserOrganizationMembership)
        private membershipModel: typeof UserOrganizationMembership,
    ) { }

    async updateUser(userId: string, updateData: any) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await user.update(updateData);
        const { password, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    async addMembership(userId: string, createMembershipDto: CreateMembershipDto) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if membership already exists
        const existing = await this.membershipModel.findOne({
            where: {
                userId,
                orgId: createMembershipDto.orgId,
            },
        });

        if (existing) {
            return existing;
        }

        return this.membershipModel.create({
            userId,
            orgId: createMembershipDto.orgId,
            roleId: createMembershipDto.roleId,
        });
    }

    async getMemberships(userId: string) {
        return this.membershipModel.findAll({
            where: { userId },
            include: ['role'], // Assuming association is set up
        });
    }
}
