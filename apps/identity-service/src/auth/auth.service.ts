import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { UserOrganizationMembership } from '../users/models/user-tenant-membership.model';
import { Role } from '../users/models/role.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(UserOrganizationMembership)
        private membershipModel: typeof UserOrganizationMembership,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<User | null> {
        const user = await this.userModel.findOne({ where: { email } });
        if (user && user.password && await bcrypt.compare(pass, user.password)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user.toJSON();
            return user;
        }
        return null;
    }

    /**
     * Get user's primary tenant membership for JWT payload
     */
    private async getPrimaryMembership(userId: string): Promise<{orgId?: string, roles: string[]}> {
        const memberships = await this.membershipModel.findAll({
            where: { userId },
            include: [{ model: Role, attributes: ['name'] }],
            order: [['createdAt', 'ASC']], // Default: use oldest membership as primary (TODO: Add explicit isPrimary flag)
        });

        if (memberships.length === 0) {
            console.log(`DEBUG: No memberships found for user ${userId}`);
            return { orgId: undefined, roles: [] };
        }
        console.log(`DEBUG: Found ${memberships.length} memberships for user ${userId}. Primary: ${memberships[0].orgId}`);

        const primary = memberships[0];
        const roles = primary.role?.name ? [primary.role.name] : [];
        
        return {
            orgId: primary.orgId,
            roles,
        };
    }

    /**
     * Build JWT payload with tenant context
     */
    private async buildJwtPayload(user: User) {
        const { orgId, roles } = await this.getPrimaryMembership(user.id);
        return {
            email: user.email,
            sub: user.id,
            orgId,
            roles,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = await this.buildJwtPayload(user);
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
            orgId: payload.orgId, // Return orgId for frontend storage
        };
    }

    async register(registerDto: RegisterDto) {
        try {
            const existingUser = await this.userModel.findOne({ where: { email: registerDto.email } });
            if (existingUser) {
                throw new ConflictException('User already exists');
            }

            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            const user = await this.userModel.create({
                ...registerDto,
                password: hashedPassword,
            });

            // TODO: Create default UserOrganizationMembership if needed

            // Return user object without password, plus access token for convenience
            const { password, ...userWithoutPassword } = user.toJSON();
            const payload = await this.buildJwtPayload(user);

            return {
                ...userWithoutPassword,
                access_token: this.jwtService.sign(payload),
                orgId: payload.orgId, // Return orgId for frontend storage
            };
        } catch (error: any) {
            console.error('REGISTER_ERROR:', error);
            // Handle unique constraint violation (race condition)
            if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
                 throw new ConflictException('User already exists');
            }
            throw error;
        }
    }

    async loginWithGoogle(user: User) {
        const payload = await this.buildJwtPayload(user);
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
            orgId: payload.orgId, // Return orgId for frontend storage
        };
    }

    async validateGoogleUser(googleUser: { email: string, firstName: string, lastName: string, picture: string, accessToken: string }) {
        let user = await this.userModel.findOne({ where: { email: googleUser.email } });
        if (!user) {
            // Create user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            user = await this.userModel.create({
                email: googleUser.email,
                firstName: googleUser.firstName,
                lastName: googleUser.lastName,
                password: hashedPassword,
                // picture: googleUser.picture // Assuming we might add picture later
            });
        }
        return user;
    }

    /**
     * Switch to a different tenant (for multi-org users)
     */
    async switchTenant(userId: string, targetOrgId: string) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify user has membership in target tenant
        const membership = await this.membershipModel.findOne({
            where: { userId, orgId: targetOrgId },
            include: [{ model: Role, attributes: ['name'] }],
        });

        if (!membership) {
            throw new UnauthorizedException('No access to this tenant');
        }

        const roles = membership.role?.name ? [membership.role.name] : [];
        const payload = {
            email: user.email,
            sub: user.id,
            orgId: targetOrgId,
            roles,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
            orgId: targetOrgId,
        };
    }
}

