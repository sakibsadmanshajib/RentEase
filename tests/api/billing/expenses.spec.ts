import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../helpers/api.helper';

const BASE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3004';

test.describe('Billing Service - Expenses @api', () => {
    const tenantId = `tenant-${ApiHelper.generateTestId()}`;

    test('should create a one-time expense', async ({ request }) => {
        const expenseData = {
            tenantId,
            category: 'REPAIR',
            description: 'Plumbing repair',
            amount: 250,
            currency: 'USD',
            isRecurring: false
        };

        const response = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: { 'Content-Type': 'application/json' },
            data: expenseData
        });

        expect(response.status()).toBe(201);
        const expense = await response.json();
        expect(expense).toHaveProperty('id');
        expect(expense.amount).toBe(250);
        expect(expense.category).toBe('REPAIR');
        expect(expense.isRecurring).toBe(false);
    });

    test('should create a weekly recurring expense', async ({ request }) => {
        const expenseData = {
            tenantId,
            category: 'MAINTENANCE',
            description: 'Weekly lawn service',
            amount: 150,
            currency: 'USD',
            isRecurring: true,
            recurrenceType: 'WEEKLY',
            recurrenceInterval: 1,
            recurrenceMaxOccurrences: 6
        };

        const response = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: { 'Content-Type': 'application/json' },
            data: expenseData
        });

        expect(response.status()).toBe(201);
        const expense = await response.json();
        expect(expense).toHaveProperty('id');
        expect(expense.isRecurring).toBe(true);
        expect(expense.recurrenceType).toBe('WEEKLY');
        expect(expense).toHaveProperty('nextOccurrence');
        expect(expense).toHaveProperty('occurrenceCount');
    });

    test('should create a monthly recurring expense', async ({ request }) => {
        const expenseData = {
            tenantId,
            category: 'INSURANCE',
            description: 'Monthly insurance',
            amount: 100,
            currency: 'USD',
            isRecurring: true,
            recurrenceType: 'MONTHLY',
            recurrenceInterval: 1,
            recurrenceMaxOccurrences: 12
        };

        const response = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: { 'Content-Type': 'application/json' },
            data: expenseData
        });

        expect(response.status()).toBe(201);
        const expense = await response.json();
        expect(expense.isRecurring).toBe(true);
        expect(expense.recurrenceType).toBe('MONTHLY');
    });

    test('should create a custom recurring expense (first Sunday of month)', async ({ request }) => {
        const expenseData = {
            tenantId,
            category: 'UTILITIES',
            description: 'First Sunday utility expense',
            amount: 100,
            currency: 'USD',
            isRecurring: true,
            recurrenceType: 'CUSTOM',
            recurrenceDayOfWeek: 0, // Sunday
            recurrenceMaxOccurrences: 6
        };

        const response = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: { 'Content-Type': 'application/json' },
            data: expenseData
        });

        expect(response.status()).toBe(201);
        const expense = await response.json();
        expect(expense.isRecurring).toBe(true);
        expect(expense.recurrenceType).toBe('CUSTOM');
        expect(expense).toHaveProperty('nextOccurrence');
    });

    test('should list all expenses for a tenant', async ({ request }) => {
        // Create a couple of expenses
        await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                category: 'REPAIR',
                description: 'Test expense 1',
                amount: 100,
                currency: 'USD',
                isRecurring: false
            }
        });

        await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                category: 'MAINTENANCE',
                description: 'Test expense 2',
                amount: 200,
                currency: 'USD',
                isRecurring: false
            }
        });

        // List expenses
        const response = await request.get(
            `${BASE_URL}/invoices/expenses?tenantId=${tenantId}`
        );

        expect(response.status()).toBe(200);
        const expenses = await response.json();
        expect(Array.isArray(expenses)).toBe(true);
        expect(expenses.length).toBeGreaterThanOrEqual(2);
    });

    test('should create ledger entries when expense is recorded', async ({ request }) => {
        const expenseData = {
            tenantId,
            category: 'REPAIR',
            description: 'HVAC repair',
            amount: 500,
            currency: 'USD',
            isRecurring: false
        };

        // Get ledger before expense
        const ledgerBefore = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${tenantId}`
        );
        const entriesBefore = await ledgerBefore.json();
        const countBefore = entriesBefore.length;

        // Create expense
        await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: { 'Content-Type': 'application/json' },
            data: expenseData
        });

        // Get ledger after expense
        const ledgerAfter = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${tenantId}`
        );
        const entriesAfter = await ledgerAfter.json();

        // Should have more entries
        expect(entriesAfter.length).toBeGreaterThan(countBefore);

        // Ledger should be balanced
        const totalDebit = entriesAfter.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.debit || 0), 0);
        const totalCredit = entriesAfter.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.credit || 0), 0);
        expect(totalDebit).toBeCloseTo(totalCredit, 2);
    });
});
