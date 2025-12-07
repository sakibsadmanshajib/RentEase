import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Patch, Delete, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';

@Controller('tenants')
export class TenantController {
    private readonly TENANT_SERVICE_URL = 'http://localhost:3002/tenants';

    constructor(private readonly httpService: HttpService) { }

    @Post()
    async create(@Body() body: any, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.post(this.TENANT_SERVICE_URL, body, {
                headers: { Authorization: req.headers.authorization }
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
            this.httpService.get(this.TENANT_SERVICE_URL, {
                headers: { Authorization: req.headers.authorization }
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

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.TENANT_SERVICE_URL}/${id}`, {
                headers: { Authorization: req.headers.authorization }
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
    async update(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
        const response = await firstValueFrom(
            this.httpService.patch(`${this.TENANT_SERVICE_URL}/${id}`, body, {
                headers: { Authorization: req.headers.authorization }
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
            this.httpService.delete(`${this.TENANT_SERVICE_URL}/${id}`, {
                headers: { Authorization: req.headers.authorization }
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
