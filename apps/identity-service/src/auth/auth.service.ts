import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private jwtService: JwtService
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.userModel.findOne({ where: { email: loginDto.email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // TODO: Validate password (e.g. bcrypt.compare)
        // if (!bcrypt.compareSync(loginDto.password, user.password)) ...

        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
