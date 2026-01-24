import { Body, Controller, Post, HttpCode, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    private readonly isProduction = process.env.NODE_ENV === 'production';

    private readonly COOKIE_OPTIONS = {
        httpOnly: true,
        secure: this.isProduction,
        sameSite: 'lax' as const, // Required for OAuth redirects
        path: '/',
    };

    private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('accessToken', accessToken, {
            ...this.COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            ...this.COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    private clearAuthCookies(res: Response) {
        res.clearCookie('accessToken', { ...this.COOKIE_OPTIONS });
        res.clearCookie('refreshToken', { ...this.COOKIE_OPTIONS });
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, orgId } = await this.authService.login(loginDto);
        this.setAuthCookies(res, accessToken, refreshToken);
        return { orgId, message: 'Login successful' };
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(registerDto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        // Return user data without tokens (they're in cookies)
        const { accessToken, refreshToken, ...userData } = result;
        return { ...userData, message: 'Registration successful' };
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: any) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
        const { accessToken, refreshToken, orgId } = await this.authService.loginWithGoogle(req.user);
        this.setAuthCookies(res, accessToken, refreshToken);
        // Only pass non-sensitive orgId in URL for frontend context
        // Token is in HTTP-only cookie - NOT in URL (security fix)
        const params = new URLSearchParams();
        if (orgId) {
            params.set('orgId', orgId);
        }
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            this.clearAuthCookies(res);
            return { error: 'No refresh token', authenticated: false };
        }

        try {
            const result = await this.authService.refreshTokens(refreshToken);
            this.setAuthCookies(res, result.accessToken, result.refreshToken);
            return { orgId: result.orgId, message: 'Token refreshed', authenticated: true };
        } catch (error) {
            this.clearAuthCookies(res);
            return { error: 'Invalid refresh token', authenticated: false };
        }
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@Req() req: any) {
        // Fetch full profile including names
        const user = await this.authService.getUserProfile(req.user.sub);
        return { 
            ...user,
            userId: req.user.sub,
            orgId: req.user.orgId,
            roles: req.user.roles || [],
        };
    }

    @Post('switch-org')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async switchOrg(
        @Req() req: any,
        @Body('orgId') orgId: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.switchOrg(req.user.sub, orgId);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return { orgId: result.orgId };
    }

    /**
     * Logout endpoint - clears HTTP-only cookies.
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
    @HttpCode(200)
    async logout(@Res({ passthrough: true }) res: Response) {
        this.clearAuthCookies(res);
        return { message: 'Logged out successfully' };
    }
}
