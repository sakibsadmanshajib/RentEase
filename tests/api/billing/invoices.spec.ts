import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../helpers/api.helper';

const BASE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3004';

test.describe('Billing Service - Invoices @api', () => {
    const tenantId = `tenant-${ApiHelper.generateTestId()}`;

    test('should create an invoice and generate ledger entries', async ({ request }) => {
        const invoiceData = {
            tenantId,
            amount: 1500,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            currency: 'USD'
        };

        const response = await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: invoiceData
        });

        expect(response.status()).toBe(201);
        const invoice = await response.json();
        expect(invoice).toHaveProperty('id');
        expect(parseFloat(invoice.amount)).toBe(1500);
        expect(invoice.status).toBe('PENDING');
        expect(invoice.tenantId).toBe(tenantId);
    });

    test('should create ledger entries when invoice is created', async ({ request }) => {
        const invoiceData = {
            tenantId,
            amount: 1000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            currency: 'USD'
        };

        // Create invoice
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: invoiceData
        });
        expect(invoiceResponse.status()).toBe(201);

        // Check ledger entries
        const ledgerResponse = await request.get(
            `${BASE_URL}/invoices/ledger?tenantId=${tenantId}`
        );
        expect(ledgerResponse.status()).toBe(200);

        const ledgerEntries = await ledgerResponse.json();
        expect(Array.isArray(ledgerEntries)).toBe(true);
        expect(ledgerEntries.length).toBeGreaterThan(0);

        // Verify ledger is balanced
        const totalDebit = ledgerEntries.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.debit || 0), 0);
        const totalCredit = ledgerEntries.reduce((sum: number, entry: any) =>
            sum + parseFloat(entry.credit || 0), 0);

        expect(totalDebit).toBe(totalCredit);
    });

    test('should list invoices with filters', async ({ request }) => {
        // Create a couple of invoices
        await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                amount: 500,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });

        // List invoices
        const response = await request.get(
            `${BASE_URL}/invoices?tenantId=${tenantId}`
        );

        expect(response.status()).toBe(200);
        const invoices = await response.json();
        expect(Array.isArray(invoices)).toBe(true);
        expect(invoices.length).toBeGreaterThan(0);
    });

    test('should get invoice by ID', async ({ request }) => {
        // Create invoice
        const createResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                tenantId,
                amount: 750,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD'
            }
        });
        const createdInvoice = await createResponse.json();

        // Get invoice by ID
        const response = await request.get(`${BASE_URL}/invoices/${createdInvoice.id}`);
        expect(response.status()).toBe(200);

        const invoice = await response.json();
        expect(invoice.id).toBe(createdInvoice.id);
        expect(parseFloat(invoice.amount)).toBe(750);
    });
});
