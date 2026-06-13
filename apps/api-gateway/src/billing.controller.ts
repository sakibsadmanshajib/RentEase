import { Controller, Get, Post, Body, Param, Req, HttpException, HttpStatus, Patch, Delete } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { buildAuthHeaders } from './proxy.util';

const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://127.0.0.1:3004';
const PROPERTY_SERVICE_URL = process.env.PROPERTY_SERVICE_URL || 'http://127.0.0.1:3003';

@Controller('invoices')
export class BillingController {
    constructor(private readonly httpService: HttpService) { }

    private handleError(error: { response?: { data?: unknown; status?: number } }, fallback: string): never {
        throw new HttpException(error.response?.data || fallback, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Post()
    async createInvoice(@Body() data: Record<string, unknown>, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${BILLING_SERVICE_URL}/invoices`, data, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Get('me')
    async getMyInvoices(@Req() req: Request) {
        try {
            const leasesResponse = await firstValueFrom(
                this.httpService.get(`${PROPERTY_SERVICE_URL}/leases/me`, {
                    headers: buildAuthHeaders(req),
                }),
            );
            const leaseIds = (leasesResponse.data as Array<{ id: string }>).map((lease) => lease.id);
            if (leaseIds.length === 0) {
                return [];
            }

            const invoicesResponse = await firstValueFrom(
                this.httpService.get(`${BILLING_SERVICE_URL}/invoices`, {
                    headers: buildAuthHeaders(req),
                }),
            );

            return (invoicesResponse.data as Array<{ leaseId?: string }>).filter(
                (invoice) => invoice.leaseId && leaseIds.includes(invoice.leaseId),
            );
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Get()
    async getInvoices(@Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${BILLING_SERVICE_URL}/invoices`, {
                    headers: buildAuthHeaders(req),
                    params: req.query,
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Get(':id')
    async getInvoiceById(@Param('id') id: string, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${BILLING_SERVICE_URL}/invoices/${id}`, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Post('payments')
    async createPayment(@Body() data: Record<string, unknown>, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${BILLING_SERVICE_URL}/invoices/payments`, data, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Patch(':id')
    async updateInvoice(@Param('id') id: string, @Body() data: Record<string, unknown>, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.patch(`${BILLING_SERVICE_URL}/invoices/${id}`, data, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Delete(':id')
    async deleteInvoice(@Param('id') id: string, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.delete(`${BILLING_SERVICE_URL}/invoices/${id}`, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Get('ledger')
    async getLedger(@Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${BILLING_SERVICE_URL}/invoices/ledger`, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Post('expenses')
    async createExpense(@Body() data: Record<string, unknown>, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${BILLING_SERVICE_URL}/invoices/expenses`, data, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Get('expenses')
    async getExpenses(@Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${BILLING_SERVICE_URL}/invoices/expenses`, {
                    headers: buildAuthHeaders(req),
                    params: req.query,
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Get('expenses/:id')
    async getExpenseById(@Param('id') id: string, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${BILLING_SERVICE_URL}/invoices/expenses/${id}`, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Patch('expenses/:id')
    async updateExpense(@Param('id') id: string, @Body() data: Record<string, unknown>, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.patch(`${BILLING_SERVICE_URL}/invoices/expenses/${id}`, data, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }

    @Delete('expenses/:id')
    async deleteExpense(@Param('id') id: string, @Req() req: Request) {
        try {
            const response = await firstValueFrom(
                this.httpService.delete(`${BILLING_SERVICE_URL}/invoices/expenses/${id}`, {
                    headers: buildAuthHeaders(req),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error as { response?: { data?: unknown; status?: number } }, 'Billing Service Error');
        }
    }
}
