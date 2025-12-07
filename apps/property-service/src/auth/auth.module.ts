import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
    imports: [
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
    providers: [JwtStrategy, JwtAuthGuard],
    exports: [JwtStrategy, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
