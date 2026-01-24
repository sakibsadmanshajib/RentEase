import { Body, Controller, Post, HttpCode, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: any) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: any) {
        const { accessToken, orgId } = await this.authService.loginWithGoogle(req.user);
        const params = new URLSearchParams({ 
            token: accessToken,
            ...(orgId && { orgId }) 
        });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    }

    @Post('switch-tenant')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async switchTenant(@Req() req: any, @Body('tenantId') tenantId: string) {
        return this.authService.switchTenant(req.user.id, tenantId);
    }
}

