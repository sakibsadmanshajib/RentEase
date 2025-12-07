import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../helpers/api.helper';
import { AuthHelper } from '../../helpers/auth.helper';

const BASE_URL = process.env.TENANT_SERVICE_URL || 'http://localhost:3002';
const AUTH_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4000';

test.describe('Tenant Service - Tenants @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;
    let testUserId: string;

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

    test('should create a tenant with valid data (authenticated)', async ({ request }) => {
        const tenantData = {
            firstName: 'John',
            lastName: 'Doe',
            email: `john.doe.${Date.now()}@example.com`,
            phone: '555-0123'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: tenantData
        });

        expect(response.status()).toBe(201);
        const tenant = await response.json();
        expect(tenant).toHaveProperty('id');
        // Tenant model stores combined name and renamed fields
        expect(tenant.name).toBe(`${tenantData.firstName} ${tenantData.lastName}`);
        expect(tenant.contactEmail).toBe(tenantData.email);
        expect(tenant.contactPhone).toBe(tenantData.phone);
    });

    test('should reject unauthenticated tenant creation', async ({ request }) => {
        const tenantData = {
            firstName: 'No',
            lastName: 'Auth',
            email: `noauth.${Date.now()}@example.com`,
            phone: '555-0000'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: { 'Content-Type': 'application/json' },
            data: tenantData
        });

        expect(response.status()).toBe(401);
    });

    test('should reject tenant without firstName (required field)', async ({ request }) => {
        const tenantData = {
            // Missing firstName
            lastName: 'Doe',
            email: `test.${Date.now()}@example.com`,
            phone: '555-0123'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: tenantData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject tenant without lastName (required field)', async ({ request }) => {
        const tenantData = {
            firstName: 'John',
            // Missing lastName
            email: `test.${Date.now()}@example.com`,
            phone: '555-0123'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: tenantData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject tenant without email (required field)', async ({ request }) => {
        const tenantData = {
            firstName: 'John',
            lastName: 'Doe',
            // Missing email
            phone: '555-0123'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: tenantData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject tenant with invalid email format', async ({ request }) => {
        const tenantData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'not-a-valid-email', // Invalid email format
            phone: '555-0123'
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: tenantData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject tenant without phone (required field)', async ({ request }) => {
        const tenantData = {
            firstName: 'John',
            lastName: 'Doe',
            email: `test.${Date.now()}@example.com`
            // Missing phone
        };

        const response = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: tenantData
        });

        expect(response.status()).toBe(400);
    });

    test('should list all tenants', async ({ request }) => {
        // First create a tenant to ensure there's at least one
        await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                firstName: 'List',
                lastName: 'Test',
                email: `list.test.${Date.now()}@example.com`,
                phone: '555-0456'
            }
        });

        const response = await request.get(`${BASE_URL}/tenants`);
        
        expect(response.status()).toBe(200);
        const tenants = await response.json();
        expect(Array.isArray(tenants)).toBe(true);
        expect(tenants.length).toBeGreaterThan(0);
    });

    test('should get tenant by ID', async ({ request }) => {
        // First create a tenant
        const createResponse = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                firstName: 'GetById',
                lastName: 'Test',
                email: `getbyid.test.${Date.now()}@example.com`,
                phone: '555-0789'
            }
        });
        const createdTenant = await createResponse.json();

        // Get by ID
        const response = await request.get(`${BASE_URL}/tenants/${createdTenant.id}`);
        
        expect(response.status()).toBe(200);
        const tenant = await response.json();
        expect(tenant.id).toBe(createdTenant.id);
        expect(tenant.name).toContain('GetById');
    });

    test('should update tenant', async ({ request }) => {
        // First create a tenant
        const createResponse = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                firstName: 'Update',
                lastName: 'Original',
                email: `update.test.${Date.now()}@example.com`,
                phone: '555-0111'
            }
        });
        const createdTenant = await createResponse.json();

        // Update it
        const updateData = {
            firstName: 'Updated',
            lastName: 'Modified'
        };
        const response = await request.patch(`${BASE_URL}/tenants/${createdTenant.id}`, {
            headers: { 'Content-Type': 'application/json' },
            data: updateData
        });
        
        expect(response.status()).toBe(200);
        const updatedTenant = await response.json();
        // After update, name should contain Updated and Modified
        expect(updatedTenant.name).toContain('Updated');
        expect(updatedTenant.name).toContain('Modified');
    });

    test('should delete tenant', async ({ request }) => {
        // First create a tenant
        const createResponse = await request.post(`${BASE_URL}/tenants`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                firstName: 'Delete',
                lastName: 'Test',
                email: `delete.test.${Date.now()}@example.com`,
                phone: '555-0222'
            }
        });
        const createdTenant = await createResponse.json();

        // Delete it
        const deleteResponse = await request.delete(`${BASE_URL}/tenants/${createdTenant.id}`);
        expect(deleteResponse.status()).toBe(200);

        // Verify it's gone
        const getResponse = await request.get(`${BASE_URL}/tenants/${createdTenant.id}`);
        expect(getResponse.status()).toBe(404);
    });

    test('should return 404 for non-existent tenant', async ({ request }) => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request.get(`${BASE_URL}/tenants/${fakeId}`);
        
        expect(response.status()).toBe(404);
    });
});

