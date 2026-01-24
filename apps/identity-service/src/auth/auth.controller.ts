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

    /**
     * Logout endpoint - clears client-side session context.
     * 
     * TODO: TECH DEBT - Implement server-side token blocklist for immediate JWT invalidation.
     * Current implementation is stateless (JWT remains valid until expiry).
     * For enhanced security, consider:
     * - Redis-based token blocklist with TTL matching token expiry
     * - Refresh token rotation with revocation on logout
     * - Session tracking for "logout all devices" functionality
     * 
     * See: https://jwt.io/introduction/ and Known Limitations wiki page
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async logout(@Req() req: any) {
        // Currently stateless - just acknowledge logout
        // The client is responsible for clearing stored tokens
        return { message: 'Logged out successfully' };
    }
}

