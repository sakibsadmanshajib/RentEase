import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Patch, Delete, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';
import { buildAuthHeaders } from './proxy.util';

const PROPERTY_SERVICE_URL = process.env.PROPERTY_SERVICE_URL || 'http://127.0.0.1:3003';

@Controller('units')
export class UnitController {
    constructor(private readonly httpService: HttpService) { }

    @Post()
    async create(@Body() body: Record<string, unknown>, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${PROPERTY_SERVICE_URL}/units`, body, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to create unit',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Get('property/:propertyId')
    async findByProperty(@Param('propertyId') propertyId: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.get(`${PROPERTY_SERVICE_URL}/units/property/${propertyId}`, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch units',
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
            this.httpService.get(`${PROPERTY_SERVICE_URL}/units/${id}`, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch unit',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.patch(`${PROPERTY_SERVICE_URL}/units/${id}/status`, body, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to update unit status',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }
}
