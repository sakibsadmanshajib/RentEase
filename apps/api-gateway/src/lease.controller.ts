import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Patch, Delete } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Controller('leases')
export class LeaseController {
    private readonly PROPERTY_SERVICE_URL = 'http://localhost:3003/leases';

    constructor(private readonly httpService: HttpService) { }

    @Post()
    async create(@Body() body: any) {
        const response = await firstValueFrom(
            this.httpService.post(this.PROPERTY_SERVICE_URL, body).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to create lease',
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
                        error.response?.data || 'Failed to fetch leases',
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
                        error.response?.data || 'Failed to fetch lease',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Get('tenant/:tenantId')
    async findByTenant(@Param('tenantId') tenantId: string) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.PROPERTY_SERVICE_URL}/tenant/${tenantId}`).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch tenant leases',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        const response = await firstValueFrom(
            this.httpService.patch(`${this.PROPERTY_SERVICE_URL}/${id}`, body).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to update lease',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const response = await firstValueFrom(
            this.httpService.delete(`${this.PROPERTY_SERVICE_URL}/${id}`).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to delete lease',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }
}
