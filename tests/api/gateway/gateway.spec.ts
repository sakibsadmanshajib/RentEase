import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

test.describe('API Gateway - Authentication Forwarding @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;
    let testEmail: string;

    test.beforeAll(async () => {
        authHelper = new AuthHelper(GATEWAY_URL);
        testEmail = `gateway-test-${Date.now()}@example.com`;
        const userData = {
            email: testEmail,
            password: 'Password123!',
            firstName: 'Gateway',
            lastName: 'Tester',
            phone: '555-0888'
        };
        await authHelper.register(userData);
        authToken = await authHelper.login(userData.email, userData.password) || '';
    });

    test('should forward auth header and create tenant via gateway', async ({ request }) => {
        const tenantData = {
            firstName: 'Gateway',
            lastName: 'Tenant',
            email: `gateway-tenant-${Date.now()}@example.com`,
            phone: '555-1111'
        };

        const response = await request.post(`${GATEWAY_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: tenantData
        });

        expect(response.status()).toBe(201);
        const tenant = await response.json();
        expect(tenant).toHaveProperty('id');
    });

    test('should return 401 when no auth header provided to protected route', async ({ request }) => {
        const tenantData = {
            firstName: 'NoAuth',
            lastName: 'Tenant',
            email: `noauth-${Date.now()}@example.com`,
            phone: '555-2222'
        };

        const response = await request.post(`${GATEWAY_URL}/tenants`, {
            headers: { 'Content-Type': 'application/json' },
            data: tenantData
        });

        expect(response.status()).toBe(401);
    });

    test('should return 401 when invalid token provided', async ({ request }) => {
        const tenantData = {
            firstName: 'BadToken',
            lastName: 'Tenant',
            email: `badtoken-${Date.now()}@example.com`,
            phone: '555-3333'
        };

        const response = await request.post(`${GATEWAY_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid-token-here'
            },
            data: tenantData
        });

        expect(response.status()).toBe(401);
    });

    test('should forward auth header and create property via gateway', async ({ request }) => {
        const propertyData = {
            name: `Gateway Property ${Date.now()}`,
            address: '100 Gateway Street',
            tenantId: `tenant-gateway-${Date.now()}`
        };

        const response = await request.post(`${GATEWAY_URL}/properties`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: propertyData
        });

        expect(response.status()).toBe(201);
        const property = await response.json();
        expect(property).toHaveProperty('id');
        expect(property.name).toBe(propertyData.name);
    });

    test('should forward auth header and create lease via gateway', async ({ request }) => {
        // First create a property
        const propertyData = {
            name: `Lease Gateway Property ${Date.now()}`,
            address: '200 Lease Gateway St',
            tenantId: `tenant-lease-${Date.now()}`
        };

        const propResponse = await request.post(`${GATEWAY_URL}/properties`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: propertyData
        });
        const property = await propResponse.json();

        // Now create a lease
        const leaseData = {
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            rentAmount: 2000,
            propertyId: property.id,
            tenantId: propertyData.tenantId
        };

        const response = await request.post(`${GATEWAY_URL}/leases`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: leaseData
        });

        expect(response.status()).toBe(201);
        const lease = await response.json();
        expect(lease).toHaveProperty('id');
    });

    test('should forward auth header and create invoice via gateway', async ({ request }) => {
        const invoiceData = {
            tenantId: `tenant-invoice-${Date.now()}`,
            amount: 1250,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            currency: 'USD'
        };

        const response = await request.post(`${GATEWAY_URL}/invoices`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: invoiceData
        });

        expect(response.status()).toBe(201);
        const invoice = await response.json();
        expect(invoice).toHaveProperty('id');
    });

    test('should access public routes without auth', async ({ request }) => {
        // Properties list should be accessible
        const response = await request.get(`${GATEWAY_URL}/properties`);
        expect(response.status()).toBe(200);
    });
});
