import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Patch, Delete, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';
import { buildAuthHeaders } from './proxy.util';

const ORGANIZATION_SERVICE_URL = process.env.ORGANIZATION_SERVICE_URL || 'http://127.0.0.1:3005';

@Controller('tenants')
export class TenantController {
    constructor(private readonly httpService: HttpService) { }

    @Post()
    async create(@Body() body: Record<string, unknown>, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${ORGANIZATION_SERVICE_URL}/tenants`, body, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to create tenant',
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
            this.httpService.get(`${ORGANIZATION_SERVICE_URL}/tenants`, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch tenants',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Post('invitations/:token/accept')
    async acceptInvitation(@Param('token') token: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${ORGANIZATION_SERVICE_URL}/tenants/invitations/${token}/accept`, {}, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to accept invitation',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Post(':id/invitations')
    async createInvitation(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${ORGANIZATION_SERVICE_URL}/tenants/${id}/invitations`, body, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to create invitation',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }

    @Post(':id/suspend')
    async suspend(@Param('id') id: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(`${ORGANIZATION_SERVICE_URL}/tenants/${id}/suspend`, {}, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to suspend tenant',
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
            this.httpService.post(`${ORGANIZATION_SERVICE_URL}/tenants/${id}/activate`, {}, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to activate tenant',
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
            this.httpService.get(`${ORGANIZATION_SERVICE_URL}/tenants/${id}`, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to fetch tenant',
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
            this.httpService.patch(`${ORGANIZATION_SERVICE_URL}/tenants/${id}`, body, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to update tenant',
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
            this.httpService.delete(`${ORGANIZATION_SERVICE_URL}/tenants/${id}`, {
                headers: buildAuthHeaders(req),
            }).pipe(
                catchError((error) => {
                    throw new HttpException(
                        error.response?.data || 'Failed to delete tenant',
                        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }),
            ),
        );
        return response.data;
    }
}
