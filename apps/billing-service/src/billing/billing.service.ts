import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cron } from '@nestjs/schedule';
import { Op } from 'sequelize';
import { OrganizationContext } from '@rentease/common';
import { Invoice } from './models/invoice.model';
import { LedgerAccount } from './models/ledger-account.model';
import { LedgerEntry } from './models/ledger-entry.model';
import { Payment } from './models/payment.model';
import { Expense } from './models/expense.model';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BillingService {
    constructor(
        @InjectModel(Invoice)
        private invoiceModel: typeof Invoice,
        @InjectModel(LedgerAccount)
        private ledgerAccountModel: typeof LedgerAccount,
        @InjectModel(LedgerEntry)
        private ledgerEntryModel: typeof LedgerEntry,
        @InjectModel(Payment)
        private paymentModel: typeof Payment,
        @InjectModel(Expense)
        private expenseModel: typeof Expense,
    ) { }

    async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
        // Get orgId from context (set by OrganizationContextInterceptor from JWT)
        const orgId = OrganizationContext.getOrgId();
        if (!orgId) {
            throw new ForbiddenException('Organization context required to create invoice');
        }

        // 1. Create Invoice (orgId is auto-set by @BeforeCreate hook)
        const invoice = await this.invoiceModel.create(createInvoiceDto as any);

        // 2. Ledger Entries (Double-Entry)
        // Debit: Accounts Receivable (Asset)
        // Credit: Rental Income (Revenue)
        const arAccount = await this.getOrCreateAccount(orgId, '1100', 'Accounts Receivable', 'ASSET');
        const incomeAccount = await this.getOrCreateAccount(orgId, '4000', 'Rental Income', 'REVENUE');
        const journalId = uuidv4();

        // Debit AR (orgId set by hook)
        await this.ledgerEntryModel.create({
            journalId,
            accountId: arAccount.id,
            debit: createInvoiceDto.amount,
            credit: 0,
            currency: createInvoiceDto.currency || 'USD',
            correlationId: invoice.id,
        });

        // Credit Income (orgId set by hook)
        await this.ledgerEntryModel.create({
            journalId,
            accountId: incomeAccount.id,
            debit: 0,
            credit: createInvoiceDto.amount,
            currency: createInvoiceDto.currency || 'USD',
            correlationId: invoice.id,
        });

        return invoice;
    }

    async recordPayment(recordPaymentDto: RecordPaymentDto): Promise<Payment> {
        const invoice = await this.invoiceModel.findByPk(recordPaymentDto.invoiceId);
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        // 1. Create Payment
        const payment = await this.paymentModel.create({
            ...recordPaymentDto,
            status: 'COMPLETED',
        } as any);

        // 2. Update Invoice Status
        const payments = await this.paymentModel.findAll({ where: { invoiceId: invoice.id } });
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        if (totalPaid >= Number(invoice.amount)) {
            invoice.status = 'PAID';
        } else if (totalPaid > 0) {
            invoice.status = 'PARTIAL';
        } else {
            invoice.status = 'PENDING';
        }
        await invoice.save();

        // 3. Ledger Entries
        // Debit: Cash (Asset)
        // Credit: Accounts Receivable (Asset)
        const cashAccount = await this.getOrCreateAccount(recordPaymentDto.orgId, '1000', 'Cash', 'ASSET');
        const arAccount = await this.getOrCreateAccount(recordPaymentDto.orgId, '1100', 'Accounts Receivable', 'ASSET');
        const journalId = uuidv4();

        // Debit Cash
        await this.ledgerEntryModel.create({
            orgId: recordPaymentDto.orgId,
            journalId,
            accountId: cashAccount.id,
            debit: recordPaymentDto.amount,
            credit: 0,
            currency: 'USD',
            correlationId: payment.id,
        });

        // Credit AR
        await this.ledgerEntryModel.create({
            orgId: recordPaymentDto.orgId,
            journalId,
            accountId: arAccount.id,
            debit: 0,
            credit: recordPaymentDto.amount,
            currency: 'USD',
            correlationId: payment.id,
        });

        return payment;
    }

    async getLedger(orgId: string): Promise<LedgerEntry[]> {
        return this.ledgerEntryModel.findAll({ where: { orgId } });
    }

    /**
     * Find all invoices for a specific organization.
     * SECURITY: orgId is REQUIRED for data isolation.
     */
    async findAll(filters?: { orgId?: string; leaseId?: string; status?: string }): Promise<Invoice[]> {
        if (!filters?.orgId) {
            // No organization context = no data access
            return [];
        }
        const where: any = { orgId: filters.orgId };
        if (filters?.leaseId) where.leaseId = filters.leaseId;
        if (filters?.status) where.status = filters.status;

        return this.invoiceModel.findAll({ where });
    }

    async findOne(id: string): Promise<Invoice | null> {
        return this.invoiceModel.findByPk(id);
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<[number, Invoice[]]> {
        return this.invoiceModel.update(updateInvoiceDto, {
            where: { id },
            returning: true,
        });
    }

    async remove(id: string): Promise<void> {
        const invoice = await this.findOne(id);
        if (invoice) {
            await invoice.destroy();
        }
    }

    /**
     * Find a single invoice and validate it belongs to the specified organization
     */
    async findOneForOrg(id: string, orgId: string): Promise<Invoice> {
        if (!orgId) {
            throw new ForbiddenException('Organization context required');
        }
        const invoice = await this.invoiceModel.findByPk(id);
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        if (invoice.orgId !== orgId) {
            throw new ForbiddenException('Access denied to this invoice');
        }
        return invoice;
    }

    /**
     * Update an invoice with organization validation
     */
    async updateForOrg(id: string, updateInvoiceDto: UpdateInvoiceDto, orgId: string): Promise<[number, Invoice[]]> {
        if (!orgId) {
            throw new ForbiddenException('Organization context required');
        }
        // Validate ownership first
        await this.findOneForOrg(id, orgId);
        // Include orgId in WHERE clause for defense in depth
        return this.invoiceModel.update(updateInvoiceDto, {
            where: { id, orgId },
            returning: true,
        });
    }

    /**
     * Remove an invoice with organization validation
     */
    async removeForOrg(id: string, orgId: string): Promise<void> {
        const invoice = await this.findOneForOrg(id, orgId);
        await invoice.destroy();
    }

    private async getOrCreateAccount(orgId: string, code: string, name: string, type: string): Promise<LedgerAccount> {
        const [account] = await this.ledgerAccountModel.findOrCreate({
            where: { orgId, code },
            defaults: { name, type } as any,
        });
        return account;
    }

    // ============ EXPENSE METHODS ============

    async createExpense(createExpenseDto: CreateExpenseDto): Promise<Expense> {
        // 1. Create Expense
        const expense = await this.expenseModel.create({
            ...createExpenseDto,
            date: createExpenseDto.date || new Date(),
        } as any);

        // 2. Calculate next occurrence if recurring
        if (expense.isRecurring) {
            expense.nextOccurrence = this.calculateNextOccurrence(expense) || undefined;
            await expense.save();
        }

        // 3. Create Ledger Entries
        // Debit: Expense Account
        // Credit: Cash (if paid) or Accounts Payable (if not)
        const expenseAccount = await this.getOrCreateAccount(
            expense.orgId,
            `5${expense.category.substring(0, 3)}`,
            `Expense:${expense.category}`,
            'EXPENSE'
        );
        const creditAccount = await this.getOrCreateAccount(
            expense.orgId,
            '1000',
            'Cash',
            'ASSET'
        );
        const journalId = uuidv4();

        // Debit Expense
        await this.ledgerEntryModel.create({
            orgId: expense.orgId,
            journalId,
            accountId: expenseAccount.id,
            debit: expense.amount,
            credit: 0,
            currency: expense.currency,
            correlationId: expense.id,
        });

        // Credit Cash
        await this.ledgerEntryModel.create({
            orgId: expense.orgId,
            journalId,
            accountId: creditAccount.id,
            debit: 0,
            credit: expense.amount,
            currency: expense.currency,
            correlationId: expense.id,
        });

        return expense;
    }

    async getExpenses(filters: any): Promise<Expense[]> {
        const where: any = {};
        if (filters.orgId) where.orgId = filters.orgId;
        if (filters.propertyId) where.propertyId = filters.propertyId;
        if (filters.category) where.category = filters.category;

        return this.expenseModel.findAll({ where });
    }

    async getExpenseById(id: string): Promise<Expense | null> {
        return this.expenseModel.findByPk(id);
    }

    async updateExpense(id: string, updates: Partial<CreateExpenseDto>): Promise<Expense | null> {
        const expense = await this.expenseModel.findByPk(id);
        if (!expense) return null;

        await expense.update(updates);

        // Recalculate next occurrence if recurrence settings changed
        if (expense.isRecurring && (updates.recurrenceType || updates.recurrenceInterval)) {
            expense.nextOccurrence = this.calculateNextOccurrence(expense) || undefined;
            await expense.save();
        }

        return expense;
    }

    async deleteExpense(id: string): Promise<void> {
        const expense = await this.expenseModel.findByPk(id);
        if (expense) {
            await expense.destroy();
        }
    }

    /**
     * Get expense by ID and validate it belongs to the specified organization
     */
    async getExpenseByIdForOrg(id: string, orgId: string): Promise<Expense> {
        if (!orgId) {
            throw new ForbiddenException('Organization context required');
        }
        const expense = await this.expenseModel.findByPk(id);
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
        if (expense.orgId !== orgId) {
            throw new ForbiddenException('Access denied to this expense');
        }
        return expense;
    }

    /**
     * Update an expense with organization validation
     */
    async updateExpenseForOrg(id: string, updates: Partial<CreateExpenseDto>, orgId: string): Promise<Expense> {
        const expense = await this.getExpenseByIdForOrg(id, orgId);
        await expense.update(updates);

        // Recalculate next occurrence if recurrence settings changed
        if (expense.isRecurring && (updates.recurrenceType || updates.recurrenceInterval)) {
            expense.nextOccurrence = this.calculateNextOccurrence(expense) || undefined;
            await expense.save();
        }

        return expense;
    }

    /**
     * Delete an expense with organization validation
     */
    async deleteExpenseForOrg(id: string, orgId: string): Promise<void> {
        const expense = await this.getExpenseByIdForOrg(id, orgId);
        await expense.destroy();
    }

    // Calculate next occurrence based on recurrence pattern
    private calculateNextOccurrence(expense: Expense): Date | null {
        if (!expense.isRecurring || !expense.recurrenceType) return null;

        // Check if we've reached max occurrences
        if (expense.recurrenceMaxOccurrences && expense.occurrenceCount >= expense.recurrenceMaxOccurrences) {
            return null;
        }

        const base = expense.nextOccurrence || expense.date;
        const next = new Date(base);
        const interval = expense.recurrenceInterval || 1;

        switch (expense.recurrenceType) {
            case 'DAILY':
                next.setDate(next.getDate() + interval);
                break;

            case 'WEEKLY':
                next.setDate(next.getDate() + (7 * interval));
                break;

            case 'BIWEEKLY':
                next.setDate(next.getDate() + 14);
                break;

            case 'MONTHLY':
                if (expense.recurrenceDayOfMonth) {
                    // Specific day of month
                    next.setMonth(next.getMonth() + interval);
                    next.setDate(expense.recurrenceDayOfMonth);
                } else {
                    // Same day next month
                    next.setMonth(next.getMonth() + interval);
                }
                break;

            case 'YEARLY':
                next.setFullYear(next.getFullYear() + interval);
                break;

            case 'CUSTOM':
                // Custom logic for complex patterns like "first Sunday of month"
                if (expense.recurrenceDayOfWeek !== undefined) {
                    next.setMonth(next.getMonth() + 1);
                    next.setDate(1);

                    // Find first occurrence of target day
                    const targetDay = expense.recurrenceDayOfWeek;
                    while (next.getDay() !== targetDay) {
                        next.setDate(next.getDate() + 1);
                    }
                }
                break;
        }

        // Check if we've passed the end date
        if (expense.recurrenceEndDate && next > expense.recurrenceEndDate) {
            return null;
        }

        return next;
    }

    // Process recurring expenses (runs daily at 2 AM)
    @Cron('0 2 * * *')
    async processRecurringExpenses(): Promise<void> {
        const now = new Date();
        const recurringExpenses = await this.expenseModel.findAll({
            where: {
                isRecurring: true,
                nextOccurrence: {
                    [Op.lte]: now,
                },
            },
        });

        for (const template of recurringExpenses) {
            // Create new expense occurrence directly (no HTTP context in cron jobs)
            // We explicitly set orgId since there's no OrganizationContext in cron
            const newExpense = await this.expenseModel.create({
                orgId: template.orgId, // Copy from template - cron has no context
                propertyId: template.propertyId,
                unitId: template.unitId,
                category: template.category,
                description: `${template.description} (Recurring)`,
                amount: template.amount,
                currency: template.currency,
                date: template.nextOccurrence!,
                isRecurring: false, // Individual occurrences are not recurring
            } as any);

            // Create corresponding ledger entries
            const expenseAccount = await this.getOrCreateAccount(
                template.orgId,
                `5${template.category.substring(0, 3)}`,
                `Expense:${template.category}`,
                'EXPENSE'
            );
            const cashAccount = await this.getOrCreateAccount(template.orgId, '1000', 'Cash', 'ASSET');
            const journalId = uuidv4();

            await this.ledgerEntryModel.create({
                orgId: template.orgId,
                journalId,
                accountId: expenseAccount.id,
                debit: template.amount,
                credit: 0,
                currency: template.currency,
                correlationId: newExpense.id,
            } as any);

            await this.ledgerEntryModel.create({
                orgId: template.orgId,
                journalId,
                accountId: cashAccount.id,
                debit: 0,
                credit: template.amount,
                currency: template.currency,
                correlationId: newExpense.id,
            } as any);

            // Update template's next occurrence and count
            template.occurrenceCount += 1;
            template.nextOccurrence = this.calculateNextOccurrence(template) || undefined;
            await template.save();
        }
    }
}
