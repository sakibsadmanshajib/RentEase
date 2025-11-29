import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'secretKey', // TODO: Use env variable
            signOptions: { expiresIn: '60s' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, RolesGuard],
    exports: [AuthService, RolesGuard],
})
export class AuthModule { }
