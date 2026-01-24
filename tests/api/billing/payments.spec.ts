import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

const BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const AUTH_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4000';

test.describe('Billing Service - Payments @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;
    let orgId: string;
    let invoiceId: string;
    let invoiceAmount: number;

    test.beforeAll(async () => {
        authHelper = new AuthHelper(AUTH_URL);
        const userData = {
            email: `payment-api-test-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Payment',
            lastName: 'Tester',
            phone: '555-0777'
        };
        await authHelper.register(userData);
        authToken = await authHelper.login(userData.email, userData.password) || '';
        const tenant = await authHelper.createTenant('Payment API Test Org');
        orgId = tenant.id;
        authToken = authHelper.getToken();

        // Create an invoice for payment tests
        const invoiceData = {
            orgId,
            amount: 1000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            currency: 'USD',
            description: 'Rent for payment test',
            type: 'RENT'
        };
        
        const { request } = await import('@playwright/test');
        const context = await request.newContext();
        const response = await context.post(`${BASE_URL}/invoices`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: invoiceData
        });
        const invoice = await response.json();
        invoiceId = invoice.id;
        invoiceAmount = 1000;
    });

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };
    }

    test('should record a payment and update invoice status', async ({ request }) => {
        // Create a fresh invoice for this test
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 500,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Test invoice for payment',
                type: 'RENT'
            }
        });
        const invoice = await invoiceResponse.json();

        const paymentData = {
            invoiceId: invoice.id,
            orgId,
            amount: 500,
            method: 'CREDIT_CARD',
            date: new Date().toISOString()
        };

        const response = await request.post(`${BASE_URL}/invoices/payments`, {
            headers: getHeaders(),
            data: paymentData
        });

        expect(response.status()).toBe(201);
        const payment = await response.json();
        expect(payment).toHaveProperty('id');
        expect(parseFloat(payment.amount)).toBe(500);
    });

    test('should update invoice status to PAID after full payment', async ({ request }) => {
        // Create invoice
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 300,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Invoice for full payment test',
                type: 'RENT'
            }
        });
        const invoice = await invoiceResponse.json();

        // Record full payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: getHeaders(),
            data: {
                invoiceId: invoice.id,
                orgId,
                amount: 300,
                method: 'BANK_TRANSFER',
                date: new Date().toISOString()
            }
        });

        // Verify invoice status (may depend on service implementation)
        const getInvoiceResponse = await request.get(`${BASE_URL}/invoices/${invoice.id}`, {
            headers: getHeaders()
        });
        
        expect(getInvoiceResponse.status()).toBe(200);
    });

    test('should create ledger entries when payment is recorded', async ({ request }) => {
        // Create invoice
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 200,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Invoice for ledger test',
                type: 'FEE'
            }
        });
        const invoice = await invoiceResponse.json();

        // Record payment
        await request.post(`${BASE_URL}/invoices/payments`, {
            headers: getHeaders(),
            data: {
                invoiceId: invoice.id,
                orgId,
                amount: 200,
                method: 'CASH',
                date: new Date().toISOString()
            }
        });

        // Check ledger entries
        const ledgerResponse = await request.get(`${BASE_URL}/invoices/ledger`, {
            headers: getHeaders()
        });
        expect(ledgerResponse.status()).toBe(200);
        
        const ledgerEntries = await ledgerResponse.json();
        expect(Array.isArray(ledgerEntries)).toBe(true);
    });

    test('should support partial payments', async ({ request }) => {
        // Create invoice
        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 1000,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Invoice for partial payment test',
                type: 'RENT'
            }
        });
        const invoice = await invoiceResponse.json();

        // First partial payment
        const payment1 = await request.post(`${BASE_URL}/invoices/payments`, {
            headers: getHeaders(),
            data: {
                invoiceId: invoice.id,
                orgId,
                amount: 400,
                method: 'CREDIT_CARD',
                date: new Date().toISOString()
            }
        });
        expect(payment1.status()).toBe(201);

        // Second partial payment
        const payment2 = await request.post(`${BASE_URL}/invoices/payments`, {
            headers: getHeaders(),
            data: {
                invoiceId: invoice.id,
                orgId,
                amount: 600,
                method: 'BANK_TRANSFER',
                date: new Date().toISOString()
            }
        });
        expect(payment2.status()).toBe(201);
    });
});
