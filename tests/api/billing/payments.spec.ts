import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../helpers/api.helper';

const BASE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3004';

test.describe('Billing Service - Payments @api', () => {
    const tenantId = `tenant-${ApiHelper.generateTestId()}`;
    let invoiceId: string;

    test.beforeAll(async ({ request }) => {
        // Create an invoice for payment tests
        const response = await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                amount: 1000,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });

        const invoice = await response.json();
        invoiceId = invoice.id;
    });

    test('should record a payment and update invoice status', async ({ request }) => {
        const paymentData = {
            tenantId,
            invoiceId,
            amount: 1000,
            date: new Date().toISOString(),
            method: 'CASH'
        };

        const response = await request.post(`${BASE_URL}/invoices/payments`, {
            headers: { 'Content-Type': 'application/json' },
            data: paymentData
        });

        expect(response.status()).toBe(201);
        const payment = await response.json();
        expect(payment).toHaveProperty('id');
        expect(parseFloat(payment.amount)).toBe(1000);
        expect(payment.invoiceId).toBe(invoiceId);
    });

    test('should update invoice status to PAID after full payment', async ({ request }) => {
        // Create a new invoice
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                amount: 500,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });
        const invoice = await invoiceResponse.json();

        // Record full payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                invoiceId: invoice.id,
                amount: 500,
                date: new Date().toISOString(),
                method: 'CARD'
            }
        });

        // Check invoice status
        const updatedInvoiceResponse = await request.get(`${BASE_URL}/invoices/${invoice.id}`);
        const updatedInvoice = await updatedInvoiceResponse.json();
        expect(updatedInvoice.status).toBe('PAID');
    });

    test('should create ledger entries when payment is recorded', async ({ request }) => {
        // Create invoice
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                amount: 300,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });
        const invoice = await invoiceResponse.json();

        // Get ledger before payment
        const ledgerBefore = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${tenantId}`
        );
        const entriesBefore = await ledgerBefore.json();
        const countBefore = entriesBefore.length;

        // Record payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                invoiceId: invoice.id,
                amount: 300,
                date: new Date().toISOString(),
                method: 'BANK_TRANSFER'
            }
        });

        // Get ledger after payment
        const ledgerAfter = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${tenantId}`
        );
        const entriesAfter = await ledgerAfter.json();

        // Should have more entries after payment
        expect(entriesAfter.length).toBeGreaterThan(countBefore);

        // Ledger should still be balanced
        const totalDebit = entriesAfter.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.debit || 0), 0);
        const totalCredit = entriesAfter.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.credit || 0), 0);
        expect(totalDebit).toBeCloseTo(totalCredit, 2);
    });

    test('should support partial payments', async ({ request }) => {
        // Create invoice
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

        // First partial payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                invoiceId: invoice.id,
                amount: 400,
                date: new Date().toISOString(),
                method: 'CASH'
            }
        });

        // Check invoice status (should still be PENDING/PARTIAL)
        let updatedInvoice = await (await request.get(`${BASE_URL}/invoices/${invoice.id}`)).json();
        expect(updatedInvoice.status).not.toBe('PAID');

        // Second partial payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                invoiceId: invoice.id,
                amount: 600,
                date: new Date().toISOString(),
                method: 'CASH'
            }
        });

        // Now invoice should be PAID
        updatedInvoice = await (await request.get(`${BASE_URL}/invoices/${invoice.id}`)).json();
        expect(updatedInvoice.status).toBe('PAID');
    });
});
