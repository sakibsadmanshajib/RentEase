import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { BillingService } from './billing.service';
import { Invoice } from './models/invoice.model';
import { LedgerAccount } from './models/ledger-account.model';
import { LedgerEntry } from './models/ledger-entry.model';
import { Payment } from './models/payment.model';
import { Expense } from './models/expense.model';
import { NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Op } from 'sequelize';

describe('BillingService', () => {
    let service: BillingService;
    let invoiceModel: any;
    let ledgerAccountModel: any;
    let ledgerEntryModel: any;
    let paymentModel: any;
    let expenseModel: any;

    const mockInvoice = {
        id: 'invoice-123',
        tenantId: 'tenant-1',
        amount: 1000,
        status: 'PENDING',
        save: jest.fn(),
        destroy: jest.fn(),
        update: jest.fn(),
    };

    const mockLedgerAccount = {
        id: 'account-123',
        tenantId: 'tenant-1',
        code: '1100',
        name: 'Accounts Receivable',
        type: 'ASSET',
    };

    const mockPayment = {
        id: 'payment-123',
        amount: 1000,
        invoiceId: 'invoice-123',
    };

    const mockExpense = {
        id: 'expense-123',
        tenantId: 'tenant-1',
        amount: 100,
        category: 'MAINTENANCE',
        isRecurring: false,
        save: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BillingService,
                {
                    provide: getModelToken(Invoice),
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockInvoice),
                        findByPk: jest.fn().mockResolvedValue(mockInvoice),
                        findAll: jest.fn().mockResolvedValue([mockInvoice]),
                        update: jest.fn().mockResolvedValue([1, [mockInvoice]]),
                    },
                },
                {
                    provide: getModelToken(LedgerAccount),
                    useValue: {
                        findOrCreate: jest.fn().mockResolvedValue([mockLedgerAccount, true]),
                    },
                },
                {
                    provide: getModelToken(LedgerEntry),
                    useValue: {
                        create: jest.fn().mockResolvedValue({}),
                        findAll: jest.fn().mockResolvedValue([]),
                    },
                },
                {
                    provide: getModelToken(Payment),
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockPayment),
                        findAll: jest.fn().mockResolvedValue([mockPayment]),
                    },
                },
                {
                    provide: getModelToken(Expense),
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockExpense),
                        findAll: jest.fn().mockResolvedValue([mockExpense]),
                        findByPk: jest.fn().mockResolvedValue(mockExpense),
                    },
                },
            ],
        }).compile();

        service = module.get<BillingService>(BillingService);
        invoiceModel = module.get(getModelToken(Invoice));
        ledgerAccountModel = module.get(getModelToken(LedgerAccount));
        ledgerEntryModel = module.get(getModelToken(LedgerEntry));
        paymentModel = module.get(getModelToken(Payment));
        expenseModel = module.get(getModelToken(Expense));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an invoice and ledger entries', async () => {
            const dto: CreateInvoiceDto = {
                tenantId: 'tenant-1',
                leaseId: 'lease-1',
                amount: 1000,
                dueDate: new Date(),
                lineItems: [],
            };

            const result = await service.create(dto);

            expect(invoiceModel.create).toHaveBeenCalledWith(dto);
            expect(ledgerAccountModel.findOrCreate).toHaveBeenCalledTimes(2); // AR and Income
            expect(ledgerEntryModel.create).toHaveBeenCalledTimes(2); // Debit AR, Credit Income
            expect(result).toEqual(mockInvoice);
        });
    });

    describe('recordPayment', () => {
        it('should record a payment and update invoice status to PAID', async () => {
            const dto: RecordPaymentDto = {
                tenantId: 'tenant-1',
                invoiceId: 'invoice-123',
                amount: 1000,
                method: 'CASH',
                date: new Date(),
            };

            // Mock invoice found
            invoiceModel.findByPk.mockResolvedValue(mockInvoice);
            // Mock payments sum equals invoice amount
            paymentModel.findAll.mockResolvedValue([{ amount: 1000 }]);

            const result = await service.recordPayment(dto);

            expect(paymentModel.create).toHaveBeenCalled();
            expect(mockInvoice.save).toHaveBeenCalled();
            expect(mockInvoice.status).toBe('PAID');
            expect(ledgerEntryModel.create).toHaveBeenCalledTimes(2); // Debit Cash, Credit AR
            expect(result).toEqual(mockPayment);
        });

        it('should update invoice status to PARTIAL if payment is less than total', async () => {
            const dto: RecordPaymentDto = {
                tenantId: 'tenant-1',
                invoiceId: 'invoice-123',
                amount: 500,
                method: 'CASH',
                date: new Date(),
            };

            invoiceModel.findByPk.mockResolvedValue(mockInvoice);
            paymentModel.findAll.mockResolvedValue([{ amount: 500 }]);

            await service.recordPayment(dto);

            expect(mockInvoice.status).toBe('PARTIAL');
        });

        it('should throw NotFoundException if invoice not found', async () => {
            invoiceModel.findByPk.mockResolvedValue(null);
            const dto: RecordPaymentDto = {
                tenantId: 'tenant-1',
                invoiceId: 'invalid-id',
                amount: 1000,
                method: 'CASH',
                date: new Date(),
            };

            await expect(service.recordPayment(dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createExpense', () => {
        it('should create an expense and ledger entries', async () => {
            const dto: CreateExpenseDto = {
                tenantId: 'tenant-1',
                category: 'MAINTENANCE',
                description: 'Fix stuff',
                amount: 100,
                isRecurring: false,
            };

            const result = await service.createExpense(dto);

            expect(expenseModel.create).toHaveBeenCalled();
            expect(ledgerEntryModel.create).toHaveBeenCalledTimes(2); // Debit Expense, Credit Cash
            expect(result).toEqual(mockExpense);
        });

        it('should calculate next occurrence for recurring expense', async () => {
            const dto: CreateExpenseDto = {
                tenantId: 'tenant-1',
                category: 'MAINTENANCE',
                description: 'Weekly cleaning',
                amount: 100,
                isRecurring: true,
                recurrenceType: 'WEEKLY',
                recurrenceInterval: 1,
            };

            const mockRecurringExpense = {
                ...mockExpense,
                isRecurring: true,
                recurrenceType: 'WEEKLY',
                recurrenceInterval: 1,
                date: new Date(),
                nextOccurrence: undefined,
                save: jest.fn(),
            };
            expenseModel.create.mockResolvedValue(mockRecurringExpense);

            await service.createExpense(dto);

            expect(mockRecurringExpense.save).toHaveBeenCalled();
            expect(mockRecurringExpense.nextOccurrence).toBeDefined();
        });
    });

    describe('processRecurringExpenses', () => {
        it('should process due recurring expenses', async () => {
            const dueExpense = {
                tenantId: 'tenant-1',
                category: 'MAINTENANCE',
                description: 'Weekly cleaning',
                amount: 100,
                currency: 'USD',
                isRecurring: true,
                recurrenceType: 'WEEKLY',
                recurrenceInterval: 1,
                nextOccurrence: new Date(), // Due now
                occurrenceCount: 0,
                save: jest.fn(),
            };

            expenseModel.findAll.mockResolvedValue([dueExpense]);
            expenseModel.create.mockResolvedValue({ ...mockExpense, id: 'new-occurrence' });

            await service.processRecurringExpenses();

            expect(expenseModel.findAll).toHaveBeenCalledWith({
                where: {
                    isRecurring: true,
                    nextOccurrence: { [Op.lte]: expect.any(Date) }
                }
            });
            // Should create new occurrence
            expect(expenseModel.create).toHaveBeenCalledWith(expect.objectContaining({
                description: 'Weekly cleaning (Recurring)',
                isRecurring: false,
            }));
            // Should update template
            expect(dueExpense.save).toHaveBeenCalled();
            expect(dueExpense.occurrenceCount).toBe(1);
        });
    });
});
