import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard, RequireOrgGuard, OrgId } from '@rentease/auth';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RequireOrgGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    // ============ SPECIFIC ROUTES FIRST (before :id) ============

    @Post('payments')
    recordPayment(@Body() recordPaymentDto: RecordPaymentDto) {
        return this.billingService.recordPayment(recordPaymentDto);
    }

    @Get('ledger')
    getLedger(@OrgId() orgId: string) {
        return this.billingService.getLedger(orgId);
    }

    // ============ EXPENSE ENDPOINTS ============

    @Post('expenses')
    createExpense(@Body() createExpenseDto: CreateExpenseDto) {
        return this.billingService.createExpense(createExpenseDto);
    }

    @Get('expenses')
    getExpenses(@OrgId() orgId: string, @Query() filters: any) {
        return this.billingService.getExpenses({ ...filters, orgId });
    }

    @Get('expenses/:id')
    async getExpenseById(@Param('id') id: string, @OrgId() orgId: string) {
        return this.billingService.getExpenseByIdForOrg(id, orgId);
    }

    @Patch('expenses/:id')
    async updateExpense(@Param('id') id: string, @Body() updates: any, @OrgId() orgId: string) {
        return this.billingService.updateExpenseForOrg(id, updates, orgId);
    }

    @Delete('expenses/:id')
    async deleteExpense(@Param('id') id: string, @OrgId() orgId: string) {
        await this.billingService.deleteExpenseForOrg(id, orgId);
        return { message: 'Expense deleted successfully' };
    }

    // ============ INVOICE ENDPOINTS (parameterized routes last) ============

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.billingService.create(createInvoiceDto);
    }

    @Get()
    findAll(@OrgId() orgId: string, @Query() query: any) {
        return this.billingService.findAll({ ...query, orgId });
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @OrgId() orgId: string) {
        return this.billingService.findOneForOrg(id, orgId);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @OrgId() orgId: string) {
        return this.billingService.updateForOrg(id, updateInvoiceDto, orgId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @OrgId() orgId: string) {
        await this.billingService.removeForOrg(id, orgId);
        return { message: 'Invoice deleted successfully' };
    }
}
