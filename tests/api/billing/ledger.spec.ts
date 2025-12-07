import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../helpers/api.helper';

const BASE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3004';

test.describe('Billing Service - Ledger Integrity @api', () => {
    const tenantId = `tenant-${ApiHelper.generateTestId()}`;

    test('should maintain double-entry balance (debit = credit)', async ({ request }) => {
        // Create some financial transactions
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                amount: 1000,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });
        const invoice = await invoiceResponse.json();

        // Record payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                invoiceId: invoice.id,
                amount: 1000,
                date: new Date().toISOString(),
                method: 'CASH'
            }
        });

        // Create expense
        await request.post(`${BASE_URL}/invoices/expenses`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                category: 'MAINTENANCE',
                description: 'Test maintenance',
                amount: 200,
                currency: 'USD',
                isRecurring: false
            }
        });

        // Get ledger
        const ledgerResponse = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${tenantId}`
        );

        expect(ledgerResponse.status()).toBe(200);
        const entries = await ledgerResponse.json();

        // Calculate totals
        const totalDebit = entries.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.debit || 0), 0);
        const totalCredit = entries.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.credit || 0), 0);

        // Verify double-entry integrity
        expect(totalDebit).toBeCloseTo(totalCredit, 2);
    });

    test('should verify invoice creates AR debit and Revenue credit', async ({ request }) => {
        const testTenantId = `tenant-${ApiHelper.generateTestId()}`;

        // Create invoice
        await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId: testTenantId,
                amount: 1500,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });

        // Get ledger entries
        const ledgerResponse = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${testTenantId}`
        );
        const entries = await ledgerResponse.json();

        // Should have at least 2 entries (AR debit, Revenue credit)
        expect(entries.length).toBeGreaterThanOrEqual(2);

        // Verify balance
        const totalDebit = entries.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.debit || 0), 0);
        const totalCredit = entries.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.credit || 0), 0);
        expect(totalDebit).toBe(totalCredit);
        expect(totalDebit).toBe(1500);
    });

    test('should verify payment creates Cash debit and AR credit', async ({ request }) => {
        const testTenantId = `tenant-${ApiHelper.generateTestId()}`;

        // Create invoice
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId: testTenantId,
                amount: 800,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });
        const invoice = await invoiceResponse.json();

        // Get ledger after invoice
        const ledgerAfterInvoice = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${testTenantId}`
        );
        const entriesAfterInvoice = await ledgerAfterInvoice.json();
        const countAfterInvoice = entriesAfterInvoice.length;

        // Record payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId: testTenantId,
                invoiceId: invoice.id,
                amount: 800,
                date: new Date().toISOString(),
                method: 'CASH'
            }
        });

        // Get ledger after payment
        const ledgerAfterPayment = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${testTenantId}`
        );
        const entriesAfterPayment = await ledgerAfterPayment.json();

        // Should have more entries after payment
        expect(entriesAfterPayment.length).toBeGreaterThan(countAfterInvoice);

        // Verify still balanced
        const totalDebit = entriesAfterPayment.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.debit || 0), 0);
        const totalCredit = entriesAfterPayment.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.credit || 0), 0);
        expect(totalDebit).toBeCloseTo(totalCredit, 2);
    });

    test('should list ledger entries with correct structure', async ({ request }) => {
        const testTenantId = `tenant-${ApiHelper.generateTestId()}`;

        // Create some transactions
        await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId: testTenantId,
                amount: 500,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });

        // Get ledger
        const response = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${testTenantId}`
        );

        expect(response.status()).toBe(200);
        const entries = await response.json();
        expect(Array.isArray(entries)).toBe(true);

        // Verify entry structure
        if (entries.length > 0) {
            const entry = entries[0];
            expect(entry).toHaveProperty('id');
            expect(entry).toHaveProperty('tenantId');
            expect(entry).toHaveProperty('accountId');
            expect(entry).toHaveProperty('debit');
            expect(entry).toHaveProperty('credit');
            expect(entry).toHaveProperty('currency');
        }
    });
});
