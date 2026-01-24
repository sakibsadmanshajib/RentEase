import { Controller, Get, Post, Body, Param, UseGuards, Req, HttpException, HttpStatus, Patch, Delete } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@Controller('invoices')
export class BillingController {
    private readonly BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://127.0.0.1:3004';

    constructor(private readonly httpService: HttpService) { }

    @Post()
    async createInvoice(@Body() data: any, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.BILLING_SERVICE_URL}/invoices`, data, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async getInvoices(@Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.BILLING_SERVICE_URL}/invoices`, {
                    headers: { Authorization: req.headers.authorization },
                    params: req.query
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getInvoiceById(@Param('id') id: string, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.BILLING_SERVICE_URL}/invoices/${id}`, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('payments')
    async createPayment(@Body() data: any, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.BILLING_SERVICE_URL}/invoices/payments`, data, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch(':id')
    async updateInvoice(@Param('id') id: string, @Body() data: any, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.patch(`${this.BILLING_SERVICE_URL}/invoices/${id}`, data, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async deleteInvoice(@Param('id') id: string, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.delete(`${this.BILLING_SERVICE_URL}/invoices/${id}`, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ============ LEDGER ROUTES ============

    @Get('ledger')
    async getLedger(@Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.BILLING_SERVICE_URL}/invoices/ledger`, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ============ EXPENSE ROUTES ============

    @Post('expenses')
    async createExpense(@Body() data: any, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.BILLING_SERVICE_URL}/invoices/expenses`, data, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('expenses')
    async getExpenses(@Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.BILLING_SERVICE_URL}/invoices/expenses`, {
                    headers: { Authorization: req.headers.authorization },
                    params: req.query
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('expenses/:id')
    async getExpenseById(@Param('id') id: string, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.BILLING_SERVICE_URL}/invoices/expenses/${id}`, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('expenses/:id')
    async updateExpense(@Param('id') id: string, @Body() data: any, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.patch(`${this.BILLING_SERVICE_URL}/invoices/expenses/${id}`, data, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('expenses/:id')
    async deleteExpense(@Param('id') id: string, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.delete(`${this.BILLING_SERVICE_URL}/invoices/expenses/${id}`, {
                    headers: { Authorization: req.headers.authorization }
                })
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || 'Billing Service Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
