import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async login(loginDto: LoginDto) {
        // TODO: Validate user against database and fetch roles
        const payload = { email: loginDto.email, sub: 'dummy-id', roles: ['admin'] }; // Mock roles for now
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
