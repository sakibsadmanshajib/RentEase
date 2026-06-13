import { Controller, Post, Body, HttpException, HttpStatus, Get, Res, Req, Query, UseGuards, HttpCode } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { buildAuthHeaders, buildProxyHeaders, forwardSetCookies } from './proxy.util';

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://127.0.0.1:3001';

@Controller('auth')
export class AuthController {
    constructor(private readonly httpService: HttpService) { }

    @Post('login')
    @HttpCode(200)
    async login(@Body() body: Record<string, unknown>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const response = await firstValueFrom(
            this.httpService.post(`${IDENTITY_SERVICE_URL}/auth/login`, body, {
                headers: buildProxyHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to login',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        forwardSetCookies(res, response);
        return response.data;
    }

    @Post('register')
    async register(@Body() body: Record<string, unknown>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const response = await firstValueFrom(
            this.httpService.post(`${IDENTITY_SERVICE_URL}/auth/register`, body, {
                headers: buildProxyHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to register',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        forwardSetCookies(res, response);
        return response.data;
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const response = await firstValueFrom(
            this.httpService.post(`${IDENTITY_SERVICE_URL}/auth/refresh`, {}, {
                headers: buildProxyHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to refresh token',
                        error.response?.status || HttpStatus.UNAUTHORIZED,
                    );
                }),
            ),
        );
        forwardSetCookies(res, response);
        return response.data;
    }

    @Post('logout')
    @HttpCode(200)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const response = await firstValueFrom(
            this.httpService.post(`${IDENTITY_SERVICE_URL}/auth/logout`, {}, {
                headers: buildProxyHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to logout',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        forwardSetCookies(res, response);
        return response.data;
    }

    @Get('me')
    async me(@Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.get(`${IDENTITY_SERVICE_URL}/auth/me`, {
                headers: buildProxyHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch profile',
                        error.response?.status || HttpStatus.UNAUTHORIZED,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Post('switch-org')
    @HttpCode(200)
    async switchOrg(@Body() body: Record<string, unknown>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const response = await firstValueFrom(
            this.httpService.post(`${IDENTITY_SERVICE_URL}/auth/switch-org`, body, {
                headers: buildProxyHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to switch organization',
                        error.response?.status || HttpStatus.BAD_REQUEST,
                    );
                }),
            ),
        );
        forwardSetCookies(res, response);
        return response.data;
    }

    @Get('google')
    googleAuth(@Res() res: Response) {
        res.redirect(`${IDENTITY_SERVICE_URL}/auth/google`);
    }

    @Get('google/callback')
    googleAuthCallback(@Res() res: Response, @Query() query: Record<string, string>) {
        const params = new URLSearchParams(query).toString();
        res.redirect(`${IDENTITY_SERVICE_URL}/auth/google/callback?${params}`);
    }
}
