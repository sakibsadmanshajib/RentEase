import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                if (!secret) throw new Error('JWT_SECRET environment variable is not defined');
                return {
                    secret,
                    signOptions: { expiresIn: '1d' },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
