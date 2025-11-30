import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    // ============ SPECIFIC ROUTES FIRST (before :id) ============

    @Post('payments')
    recordPayment(@Body() recordPaymentDto: RecordPaymentDto) {
        return this.billingService.recordPayment(recordPaymentDto);
    }

    @Get('ledger')
    getLedger(@Query('tenantId') tenantId: string) {
        return this.billingService.getLedger(tenantId);
    }

    // ============ EXPENSE ENDPOINTS ============

    @Post('expenses')
    createExpense(@Body() createExpenseDto: CreateExpenseDto) {
        return this.billingService.createExpense(createExpenseDto);
    }

    @Get('expenses')
    getExpenses(@Query() filters: any) {
        return this.billingService.getExpenses(filters);
    }

    @Get('expenses/:id')
    getExpenseById(@Param('id') id: string) {
        return this.billingService.getExpenseById(id);
    }

    @Patch('expenses/:id')
    updateExpense(@Param('id') id: string, @Body() updates: any) {
        return this.billingService.updateExpense(id, updates);
    }

    @Delete('expenses/:id')
    deleteExpense(@Param('id') id: string) {
        return this.billingService.deleteExpense(id);
    }

    // ============ INVOICE ENDPOINTS (parameterized routes last) ============

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.billingService.create(createInvoiceDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.billingService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.billingService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
        return this.billingService.update(id, updateInvoiceDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.billingService.remove(id);
    }
}
