import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Patch, Delete, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';
import { buildAuthHeaders } from './proxy.util';

const PROPERTY_SERVICE_URL = process.env.PROPERTY_SERVICE_URL || 'http://127.0.0.1:3003';

@Controller('leases')
export class LeaseController {
    constructor(private readonly httpService: HttpService) { }

    @Post()
    async create(@Body() body: Record<string, unknown>, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${PROPERTY_SERVICE_URL}/leases`, body, {
                headers: buildAuthHeaders(req),
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

    @Get('me')
    async findMine(@Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.get(`${PROPERTY_SERVICE_URL}/leases/me`, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch your leases',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Get('occupants')
    async findOccupants(@Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.get(`${PROPERTY_SERVICE_URL}/leases/occupants`, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch occupants',
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
            this.httpService.get(`${PROPERTY_SERVICE_URL}/leases`, {
                headers: buildAuthHeaders(req),
                params: req.query,
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
            this.httpService.get(`${PROPERTY_SERVICE_URL}/leases/${id}`, {
                headers: buildAuthHeaders(req),
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

    @Post(':id/activate')
    async activate(@Param('id') id: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${PROPERTY_SERVICE_URL}/leases/${id}/activate`, {}, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to activate lease',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Post(':id/terminate')
    async terminate(@Param('id') id: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${PROPERTY_SERVICE_URL}/leases/${id}/terminate`, {}, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to terminate lease',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Post(':id/occupants')
    async addOccupant(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${PROPERTY_SERVICE_URL}/leases/${id}/occupants`, body, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to add occupant',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.patch(`${PROPERTY_SERVICE_URL}/leases/${id}`, body, {
                headers: buildAuthHeaders(req),
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
            this.httpService.delete(`${PROPERTY_SERVICE_URL}/leases/${id}`, {
                headers: buildAuthHeaders(req),
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
