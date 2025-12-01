import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
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

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
        };
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userModel.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.userModel.create({
            ...registerDto,
            password: hashedPassword,
        });

        // TODO: Create default UserTenantMembership if needed

        // Return user object without password, plus access token for convenience
        const { password, ...userWithoutPassword } = user.toJSON();
        const payload = { email: user.email, sub: user.id };

        return {
            ...userWithoutPassword,
            access_token: this.jwtService.sign(payload),
        };
    }
}
