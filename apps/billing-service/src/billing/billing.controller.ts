import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '@rentease/auth';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    // ============ SPECIFIC ROUTES FIRST (before :id) ============

    @Post('payments')
    recordPayment(@Body() recordPaymentDto: RecordPaymentDto) {
        return this.billingService.recordPayment(recordPaymentDto);
    }

    @Get('ledger')
    getLedger(@Request() req: any) {
        // SECURITY: Always use tenantId from JWT - no query param override allowed
        const tenantId = req.user?.tenantId;
        return this.billingService.getLedger(tenantId);
    }

    // ============ EXPENSE ENDPOINTS ============

    @Post('expenses')
    createExpense(@Body() createExpenseDto: CreateExpenseDto) {
        return this.billingService.createExpense(createExpenseDto);
    }

    @Get('expenses')
    getExpenses(@Request() req: any, @Query() filters: any) {
        // Ensure tenantId filter from JWT
        const tenantId = req.user?.tenantId;
        return this.billingService.getExpenses({ ...filters, tenantId });
    }

    @Get('expenses/:id')
    async getExpenseById(@Param('id') id: string) {
        const expense = await this.billingService.getExpenseById(id);
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
        return expense;
    }

    @Patch('expenses/:id')
    async updateExpense(@Param('id') id: string, @Body() updates: any) {
        const expense = await this.billingService.getExpenseById(id);
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
        return this.billingService.updateExpense(id, updates);
    }

    @Delete('expenses/:id')
    async deleteExpense(@Param('id') id: string) {
        const expense = await this.billingService.getExpenseById(id);
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
        await this.billingService.deleteExpense(id);
        return { message: 'Expense deleted successfully' };
    }

    // ============ INVOICE ENDPOINTS (parameterized routes last) ============

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.billingService.create(createInvoiceDto);
    }

    @Get()
    findAll(@Request() req: any, @Query() query: any) {
        // Ensure tenantId filter from JWT
        const tenantId = req.user?.tenantId;
        return this.billingService.findAll({ ...query, tenantId });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const invoice = await this.billingService.findOne(id);
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
        const invoice = await this.billingService.findOne(id);
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return this.billingService.update(id, updateInvoiceDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const invoice = await this.billingService.findOne(id);
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        await this.billingService.remove(id);
        return { message: 'Invoice deleted successfully' };
    }
}
