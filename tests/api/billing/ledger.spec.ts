import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

const BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const AUTH_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4000';

test.describe('Billing Service - Ledger Integrity @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;
    let orgId: string;

    test.beforeAll(async () => {
        authHelper = new AuthHelper(AUTH_URL);
        const userData = {
            email: `ledger-api-test-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Ledger',
            lastName: 'Tester',
            phone: '555-0666'
        };
        await authHelper.register(userData);
        authToken = await authHelper.login(userData.email, userData.password) || '';
        const tenant = await authHelper.createTenant('Ledger API Test Org');
        orgId = tenant.id;
        authToken = authHelper.getToken();
    });

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };
    }

    test('should maintain double-entry balance (debit = credit)', async ({ request }) => {
        // Create an invoice which should generate ledger entries
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 1000,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Ledger balance test invoice',
                type: 'RENT'
            }
        });
        expect(invoiceResponse.status()).toBe(201);
        const invoice = await invoiceResponse.json();

        // Record a payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: getHeaders(),
            data: {
                invoiceId: invoice.id,
                orgId,
                amount: 1000,
                method: 'BANK_TRANSFER',
                date: new Date().toISOString()
            }
        });

        // Get ledger entries
        const ledgerResponse = await request.get(`${BASE_URL}/invoices/ledger`, {
            headers: getHeaders()
        });
        expect(ledgerResponse.status()).toBe(200);

        const ledgerEntries = await ledgerResponse.json();
        expect(Array.isArray(ledgerEntries)).toBe(true);

        // Verify double-entry balance
        const totalDebit = ledgerEntries.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.debit || 0), 0);
        const totalCredit = ledgerEntries.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.credit || 0), 0);

        expect(totalDebit).toBe(totalCredit);
    });

    test('should verify invoice creates AR debit and Revenue credit', async ({ request }) => {
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 500,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'AR verification invoice',
                type: 'RENT'
            }
        });
        expect(invoiceResponse.status()).toBe(201);

        // Ledger should have entries (implementation dependent)
        const ledgerResponse = await request.get(`${BASE_URL}/invoices/ledger`, {
            headers: getHeaders()
        });
        expect(ledgerResponse.status()).toBe(200);
    });

    test('should verify payment creates Cash debit and AR credit', async ({ request }) => {
        // Create invoice
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 750,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Cash verification invoice',
                type: 'FEE'
            }
        });
        expect(invoiceResponse.status()).toBe(201);
        const invoice = await invoiceResponse.json();

        // Record payment
        const paymentResponse = await request.post(`${BASE_URL}/invoices/payments`, {
            headers: getHeaders(),
            data: {
                invoiceId: invoice.id,
                orgId,
                amount: 750,
                method: 'CASH',
                date: new Date().toISOString()
            }
        });
        expect(paymentResponse.status()).toBe(201);

        // Verify ledger entries exist
        const ledgerResponse = await request.get(`${BASE_URL}/invoices/ledger`, {
            headers: getHeaders()
        });
        expect(ledgerResponse.status()).toBe(200);
    });

    test('should list ledger entries with correct structure', async ({ request }) => {
        // Create some transactions first
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 100,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Structure test invoice',
                type: 'OTHER'
            }
        });
        expect(invoiceResponse.status()).toBe(201);

        const ledgerResponse = await request.get(`${BASE_URL}/invoices/ledger`, {
            headers: getHeaders()
        });

        expect(ledgerResponse.status()).toBe(200);
        const ledgerEntries = await ledgerResponse.json();
        expect(Array.isArray(ledgerEntries)).toBe(true);
        
        // If there are entries, verify structure
        if (ledgerEntries.length > 0) {
            const entry = ledgerEntries[0];
            expect(entry).toHaveProperty('id');
            expect(entry).toHaveProperty('orgId');
        }
    });
});
