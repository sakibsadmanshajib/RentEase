import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../helpers/api.helper';
import { AuthHelper } from '../../helpers/auth.helper';

const BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const AUTH_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4000';

test.describe('Property Service - Properties @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;
    let testTenantId: string;
    let createdPropertyId: string;

    test.beforeAll(async () => {
        // Register and login user
        authHelper = new AuthHelper(AUTH_URL);
        const userData = {
            email: `property-api-test-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Property',
            lastName: 'Tester',
            phone: '555-0777'
        };
        await authHelper.register(userData);
        authToken = await authHelper.login(userData.email, userData.password) || '';
        
        // Create a tenant (this re-logins to get updated JWT with tenantId)
        const tenant = await authHelper.createTenant('Property API Test Org');
        testTenantId = tenant.id;
        // Get the refreshed token with tenantId
        authToken = authHelper.getToken();
    });

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };
    }

    test('should create a property with valid data', async ({ request }) => {
        const propertyData = {
            name: `Test Property ${Date.now()}`,
            address: '123 Test Street',
            type: 'Residential'
        };

        const response = await request.post(`${BASE_URL}/properties`, {
            headers: getHeaders(),
            data: propertyData
        });

        expect(response.status()).toBe(201);
        const property = await response.json();
        expect(property).toHaveProperty('id');
        expect(property.name).toBe(propertyData.name);
        expect(property.address).toBe(propertyData.address);
        expect(property.orgId).toBe(testTenantId);
        
        createdPropertyId = property.id;
    });

    test('should reject property without name (required field)', async ({ request }) => {
        const propertyData = {
            address: '123 Test Street',
            // Missing name
        };

        const response = await request.post(`${BASE_URL}/properties`, {
            headers: getHeaders(),
            data: propertyData
        });

        expect(response.status()).toBe(400);
    });


    test('should list all properties', async ({ request }) => {
        // First create a property to ensure there's at least one
        await request.post(`${BASE_URL}/properties`, {
            headers: getHeaders(),
            data: {
                name: `List Test Property ${Date.now()}`,
                address: '456 List Street',
            }
        });

        const response = await request.get(`${BASE_URL}/properties`, {
            headers: getHeaders()
        });
        
        expect(response.status()).toBe(200);
        const properties = await response.json();
        expect(Array.isArray(properties)).toBe(true);
        expect(properties.length).toBeGreaterThan(0);
    });

    test('should get property by ID', async ({ request }) => {
        // First create a property
        const createResponse = await request.post(`${BASE_URL}/properties`, {
            headers: getHeaders(),
            data: {
                name: `Get By ID Property ${Date.now()}`,
                address: '789 GetById Street',
            }
        });
        const createdProperty = await createResponse.json();

        // Get by ID
        const response = await request.get(`${BASE_URL}/properties/${createdProperty.id}`, {
            headers: getHeaders()
        });
        
        expect(response.status()).toBe(200);
        const property = await response.json();
        expect(property.id).toBe(createdProperty.id);
        expect(property.name).toBe(createdProperty.name);
    });

    test('should update property', async ({ request }) => {
        // First create a property
        const createResponse = await request.post(`${BASE_URL}/properties`, {
            headers: getHeaders(),
            data: {
                name: `Update Test Property ${Date.now()}`,
                address: '111 Original Street',
            }
        });
        const createdProperty = await createResponse.json();

        // Update it
        const updateData = {
            name: 'Updated Property Name',
            address: '222 Updated Street'
        };
        const response = await request.patch(`${BASE_URL}/properties/${createdProperty.id}`, {
            headers: getHeaders(),
            data: updateData
        });
        
        expect(response.status()).toBe(200);
        const updatedProperty = await response.json();
        expect(updatedProperty.name).toBe(updateData.name);
        expect(updatedProperty.address).toBe(updateData.address);
    });

    test('should delete property', async ({ request }) => {
        // First create a property
        const createResponse = await request.post(`${BASE_URL}/properties`, {
            headers: getHeaders(),
            data: {
                name: `Delete Test Property ${Date.now()}`,
                address: '333 Delete Street',
            }
        });
        const createdProperty = await createResponse.json();

        // Delete it
        const deleteResponse = await request.delete(`${BASE_URL}/properties/${createdProperty.id}`, {
            headers: getHeaders()
        });
        expect(deleteResponse.status()).toBe(200);

        // Verify it's gone
        const getResponse = await request.get(`${BASE_URL}/properties/${createdProperty.id}`, {
            headers: getHeaders()
        });
        expect(getResponse.status()).toBe(404);
    });

    test('should return 404 for non-existent property', async ({ request }) => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request.get(`${BASE_URL}/properties/${fakeId}`, {
            headers: getHeaders()
        });
        
        expect(response.status()).toBe(404);
    });
});
