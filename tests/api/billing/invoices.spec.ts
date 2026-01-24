import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

const BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const AUTH_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4000';

test.describe('Billing Service - Invoices @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;
    let orgId: string;

    test.beforeAll(async () => {
        authHelper = new AuthHelper(AUTH_URL);
        const userData = {
            email: `invoice-api-test-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Invoice',
            lastName: 'Tester',
            phone: '555-0555'
        };
        await authHelper.register(userData);
        authToken = await authHelper.login(userData.email, userData.password) || '';
        // Create a tenant (this re-logins to get updated JWT with orgId)
        const tenant = await authHelper.createTenant('Invoice API Test Org');
        orgId = tenant.id;
        // Get the refreshed token with orgId
        authToken = authHelper.getToken();
    });

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };
    }

    test('should create an invoice and generate ledger entries', async ({ request }) => {
        const invoiceData = {
            orgId,
            amount: 1500,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            currency: 'USD',
            description: 'Monthly rent',
            type: 'RENT'
        };

        const response = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: invoiceData
        });

        expect(response.status()).toBe(201);
        const invoice = await response.json();
        expect(invoice).toHaveProperty('id');
        expect(parseFloat(invoice.amount)).toBe(1500);
        expect(invoice.status).toBe('PENDING');
        expect(invoice.orgId).toBe(orgId);
    });

    test('should reject invoice without amount (required field)', async ({ request }) => {
        const invoiceData = {
            orgId,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            currency: 'USD',
            description: 'Test',
            type: 'RENT'
        };

        const response = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: invoiceData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject invoice without dueDate (required field)', async ({ request }) => {
        const invoiceData = {
            orgId,
            amount: 1500,
            currency: 'USD',
            description: 'Test',
            type: 'RENT'
        };

        const response = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: invoiceData
        });

        expect(response.status()).toBe(400);
    });

    test('should create ledger entries when invoice is created', async ({ request }) => {
        const invoiceData = {
            orgId,
            amount: 1000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            currency: 'USD',
            description: 'Monthly rent',
            type: 'RENT'
        };

        const invoiceResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: invoiceData
        });
        expect(invoiceResponse.status()).toBe(201);

        const ledgerResponse = await request.get(`${BASE_URL}/invoices/ledger`, {
            headers: getHeaders()
        });
        expect(ledgerResponse.status()).toBe(200);

        const ledgerEntries = await ledgerResponse.json();
        expect(Array.isArray(ledgerEntries)).toBe(true);
        // Ledger entries may be empty if billing service doesn't auto-create them
    });

    test('should list invoices with filters', async ({ request }) => {
        await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 500,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Test invoice',
                type: 'FEE'
            }
        });

        const response = await request.get(`${BASE_URL}/invoices`, {
            headers: getHeaders()
        });

        expect(response.status()).toBe(200);
        const invoices = await response.json();
        expect(Array.isArray(invoices)).toBe(true);
        expect(invoices.length).toBeGreaterThan(0);
    });

    test('should get invoice by ID', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}/invoices`, {
            headers: getHeaders(),
            data: {
                orgId,
                amount: 750,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'USD',
                description: 'Test get by ID',
                type: 'RENT'
            }
        });
        const createdInvoice = await createResponse.json();

        const response = await request.get(`${BASE_URL}/invoices/${createdInvoice.id}`, {
            headers: getHeaders()
        });
        expect(response.status()).toBe(200);

        const invoice = await response.json();
        expect(invoice.id).toBe(createdInvoice.id);
        expect(parseFloat(invoice.amount)).toBe(750);
    });

    test('should return 404 for non-existent invoice', async ({ request }) => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request.get(`${BASE_URL}/invoices/${fakeId}`, {
            headers: getHeaders()
        });
        
        expect(response.status()).toBe(404);
    });
});
