import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

const BASE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3004';
const AUTH_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

test.describe('Billing Service - Expenses @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;
    let orgId: string;

    test.beforeAll(async () => {
        authHelper = new AuthHelper(AUTH_URL);
        const userData = {
            email: `expense-api-test-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Expense',
            lastName: 'Tester',
            phone: '555-0888'
        };
        await authHelper.register(userData);
        authToken = await authHelper.login(userData.email, userData.password) || '';
        const tenant = await authHelper.createTenant('Expense API Test Org');
        orgId = tenant.id;
        authToken = authHelper.getToken();
    });

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };
    }

    test('should create a one-time expense', async ({ request }) => {
        const expenseData = {
            category: 'REPAIR',
            description: 'Plumbing repair',
            amount: 250,
            currency: 'USD',
            date: new Date().toISOString(),
            isRecurring: false
        };

        const response = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: getHeaders(),
            data: expenseData
        });

        expect(response.status()).toBe(201);
        const expense = await response.json();
        expect(expense).toHaveProperty('id');
        expect(expense.category).toBe('REPAIR');
        expect(parseFloat(expense.amount)).toBe(250);
    });

    test('should create a weekly recurring expense', async ({ request }) => {
        const expenseData = {
            category: 'MAINTENANCE',
            description: 'Weekly cleaning service',
            amount: 100,
            currency: 'USD',
            date: new Date().toISOString(),
            isRecurring: true,
            recurrenceType: 'WEEKLY',
            recurrenceInterval: 1,
            recurrenceDayOfWeek: 1 // Monday
        };

        const response = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: getHeaders(),
            data: expenseData
        });

        expect(response.status()).toBe(201);
        const expense = await response.json();
        expect(expense.isRecurring).toBe(true);
        expect(expense.recurrenceType).toBe('WEEKLY');
    });

    test('should create a monthly recurring expense', async ({ request }) => {
        const expenseData = {
            category: 'INSURANCE',
            description: 'Monthly insurance payment',
            amount: 500,
            currency: 'USD',
            date: new Date().toISOString(),
            isRecurring: true,
            recurrenceType: 'MONTHLY',
            recurrenceDayOfMonth: 15
        };

        const response = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: getHeaders(),
            data: expenseData
        });

        expect(response.status()).toBe(201);
        const expense = await response.json();
        expect(expense.isRecurring).toBe(true);
        expect(expense.recurrenceType).toBe('MONTHLY');
    });

    test('should create a custom recurring expense (first Sunday of month)', async ({ request }) => {
        const expenseData = {
            category: 'MAINTENANCE',
            description: 'Monthly garden service',
            amount: 150,
            currency: 'USD',
            date: new Date().toISOString(),
            isRecurring: true,
            recurrenceType: 'CUSTOM',
            recurrenceInterval: 1,
            recurrenceDayOfWeek: 0 // Sunday
        };

        const response = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: getHeaders(),
            data: expenseData
        });

        expect(response.status()).toBe(201);
        const expense = await response.json();
        expect(expense.recurrenceType).toBe('CUSTOM');
    });

    test('should list all expenses for a tenant', async ({ request }) => {
        // First create an expense
        await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: getHeaders(),
            data: {
                category: 'UTILITY',
                description: 'Water bill',
                amount: 75,
                currency: 'USD',
                date: new Date().toISOString()
            }
        });

        const response = await request.get(`${BASE_URL}/invoices/expenses`, {
            headers: getHeaders()
        });

        expect(response.status()).toBe(200);
        const expenses = await response.json();
        expect(Array.isArray(expenses)).toBe(true);
        expect(expenses.length).toBeGreaterThan(0);
    });

    test('should create ledger entries when expense is recorded', async ({ request }) => {
        const expenseData = {
            category: 'REPAIR',
            description: 'AC repair',
            amount: 300,
            currency: 'USD',
            date: new Date().toISOString()
        };

        const expenseResponse = await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: getHeaders(),
            data: expenseData
        });
        expect(expenseResponse.status()).toBe(201);

        // Ledger entries should be created for the expense
        const ledgerResponse = await request.get(`${BASE_URL}/invoices/ledger`, {
            headers: getHeaders()
        });
        expect(ledgerResponse.status()).toBe(200);
        
        const ledgerEntries = await ledgerResponse.json();
        expect(Array.isArray(ledgerEntries)).toBe(true);
    });
});
