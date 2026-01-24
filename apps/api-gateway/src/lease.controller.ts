import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Patch, Delete, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';

@Controller('leases')
export class LeaseController {
    private readonly PROPERTY_SERVICE_URL = 'http://127.0.0.1:3003/leases';

    constructor(private readonly httpService: HttpService) { }

    @Post()
    async create(@Body() body: any, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(this.PROPERTY_SERVICE_URL, body, {
                headers: { Authorization: req.headers.authorization }
            }).pipe(
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
    async findAll(@Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.get(this.PROPERTY_SERVICE_URL, {
                headers: { Authorization: req.headers.authorization }
            }).pipe(
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
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.PROPERTY_SERVICE_URL}/${id}`, {
                headers: { Authorization: req.headers.authorization }
            }).pipe(
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
    async findByTenant(@Param('tenantId') tenantId: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.PROPERTY_SERVICE_URL}/tenant/${tenantId}`, {
                headers: { Authorization: req.headers.authorization }
            }).pipe(
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
    async update(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.patch(`${this.PROPERTY_SERVICE_URL}/${id}`, body, {
                headers: { Authorization: req.headers.authorization }
            }).pipe(
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
    async remove(@Param('id') id: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.delete(`${this.PROPERTY_SERVICE_URL}/${id}`, {
                headers: { Authorization: req.headers.authorization }
            }).pipe(
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
