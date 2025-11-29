import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Controller('properties')
export class PropertyController {
    private readonly PROPERTY_SERVICE_URL = 'http://localhost:3003/properties';

    constructor(private readonly httpService: HttpService) { }

    @Post()
    async create(@Body() body: any) {
        const response = await firstValueFrom(
            this.httpService.post(this.PROPERTY_SERVICE_URL, body).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to create property',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Get()
    async findAll() {
        const response = await firstValueFrom(
            this.httpService.get(this.PROPERTY_SERVICE_URL).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch properties',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.PROPERTY_SERVICE_URL}/${id}`).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch property',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }
}
