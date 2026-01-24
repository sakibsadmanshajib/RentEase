import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../helpers/api.helper';
import { AuthHelper } from '../../helpers/auth.helper';

const BASE_URL = process.env.TENANT_SERVICE_URL || 'http://localhost:3005';
const AUTH_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4000';

test.describe('Tenant Service - Tenants @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;

    test.beforeAll(async () => {
        authHelper = new AuthHelper(AUTH_URL);
        const userData = {
            email: `tenant-api-test-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Tenant',
            lastName: 'Tester',
            phone: '555-0999'
        };
        await authHelper.register(userData);
        authToken = await authHelper.login(userData.email, userData.password) || '';
    });

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };
    }

    test('should create a tenant with valid data (authenticated)', async ({ request }) => {
        const tenantData = {
            name: `John Doe ${Date.now()}`,
            contactEmail: `john.doe.${Date.now()}@example.com`,
            contactPhone: '555-0123'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: getHeaders(),
            data: tenantData
        });

        expect(response.status()).toBe(201);
        const tenant = await response.json();
        expect(tenant).toHaveProperty('id');
        expect(tenant.name).toBe(tenantData.name);
        expect(tenant.contactEmail).toBe(tenantData.contactEmail);
        expect(tenant.contactPhone).toBe(tenantData.contactPhone);
    });

    test('should reject unauthenticated tenant creation', async ({ request }) => {
        const tenantData = {
            name: 'No Auth Tenant',
            contactEmail: `noauth.${Date.now()}@example.com`,
            contactPhone: '555-0000'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: { 'Content-Type': 'application/json' },
            data: tenantData
        });

        expect(response.status()).toBe(401);
    });

    test('should reject tenant without name (required field)', async ({ request }) => {
        const tenantData = {
            // Missing name
            contactEmail: `test.${Date.now()}@example.com`,
            contactPhone: '555-0123'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: getHeaders(),
            data: tenantData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject tenant with invalid email format', async ({ request }) => {
        const tenantData = {
            name: 'Invalid Email Tenant',
            contactEmail: 'not-a-valid-email',
            contactPhone: '555-0123'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: getHeaders(),
            data: tenantData
        });

        expect(response.status()).toBe(400);
    });

    test('should list all tenants', async ({ request }) => {
        // First create a tenant to ensure there's at least one
        await request.post(`${BASE_URL}/tenants`, {
            headers: getHeaders(),
            data: {
                name: `List Test Tenant ${Date.now()}`,
                contactEmail: `list.test.${Date.now()}@example.com`,
                contactPhone: '555-0456'
            }
        });

        const response = await request.get(`${BASE_URL}/tenants`, {
            headers: getHeaders()
        });
        
        expect(response.status()).toBe(200);
        const tenants = await response.json();
        expect(Array.isArray(tenants)).toBe(true);
        expect(tenants.length).toBeGreaterThan(0);
    });

    test('should get tenant by ID', async ({ request }) => {
        // First create a tenant
        const createResponse = await request.post(`${BASE_URL}/tenants`, {
            headers: getHeaders(),
            data: {
                name: `GetById Test Tenant ${Date.now()}`,
                contactEmail: `getbyid.test.${Date.now()}@example.com`,
                contactPhone: '555-0789'
            }
        });
        const createdTenant = await createResponse.json();

        // Get by ID
        const response = await request.get(`${BASE_URL}/tenants/${createdTenant.id}`, {
            headers: getHeaders()
        });
        
        expect(response.status()).toBe(200);
        const tenant = await response.json();
        expect(tenant.id).toBe(createdTenant.id);
        expect(tenant.name).toContain('GetById');
    });

    test('should update tenant', async ({ request }) => {
        // First create a tenant
        const createResponse = await request.post(`${BASE_URL}/tenants`, {
            headers: getHeaders(),
            data: {
                name: `Update Original Tenant ${Date.now()}`,
                contactEmail: `update.test.${Date.now()}@example.com`,
                contactPhone: '555-0111'
            }
        });
        const createdTenant = await createResponse.json();

        // Update it
        const updateData = {
            name: 'Updated Modified Tenant'
        };
        const response = await request.patch(`${BASE_URL}/tenants/${createdTenant.id}`, {
            headers: getHeaders(),
            data: updateData
        });
        
        expect(response.status()).toBe(200);
        const updatedTenant = await response.json();
        expect(updatedTenant.name).toBe('Updated Modified Tenant');
    });

    test('should delete tenant', async ({ request }) => {
        // First create a tenant
        const createResponse = await request.post(`${BASE_URL}/tenants`, {
            headers: getHeaders(),
            data: {
                name: `Delete Test Tenant ${Date.now()}`,
                contactEmail: `delete.test.${Date.now()}@example.com`,
                contactPhone: '555-0222'
            }
        });
        const createdTenant = await createResponse.json();

        // Delete it
        const deleteResponse = await request.delete(`${BASE_URL}/tenants/${createdTenant.id}`, {
            headers: getHeaders()
        });
        expect(deleteResponse.status()).toBe(200);

        // Verify it's gone
        const getResponse = await request.get(`${BASE_URL}/tenants/${createdTenant.id}`, {
            headers: getHeaders()
        });
        expect(getResponse.status()).toBe(404);
    });

    test('should return 404 for non-existent tenant', async ({ request }) => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request.get(`${BASE_URL}/tenants/${fakeId}`, {
            headers: getHeaders()
        });
        
        expect(response.status()).toBe(404);
    });
});
