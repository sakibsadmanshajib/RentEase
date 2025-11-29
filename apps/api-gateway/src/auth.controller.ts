import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
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
}
