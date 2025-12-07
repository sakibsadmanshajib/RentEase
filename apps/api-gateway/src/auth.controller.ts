import { Controller, Post, Body, HttpException, HttpStatus, Get, Res, Req, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Controller('auth')
export class AuthController {
    constructor(private readonly httpService: HttpService) { }

    @Post('login')
    async login(@Body() body: any) {
        const response = await firstValueFrom(
            this.httpService.post('http://localhost:3001/auth/login', body).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to login',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Post('register')
    async register(@Body() body: any) {
        const response = await firstValueFrom(
            this.httpService.post('http://localhost:3001/auth/register', body).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to register',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Get('google')
    googleAuth(@Res() res: any) {
        res.redirect('http://localhost:3001/auth/google');
    }

    @Get('google/callback')
    googleAuthCallback(@Res() res: any, @Query() query: any) {
        // Construct query string manually to ensure all params like code, state etc are passed
        const params = new URLSearchParams(query).toString();
        res.redirect(`http://localhost:3001/auth/google/callback?${params}`);
    }
}
