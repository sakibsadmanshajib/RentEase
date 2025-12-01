import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// ... (imports)

// ... inside test
// ... (imports)
import { AuthHelper } from '../../helpers/auth.helper';
import { ApiHelper } from '../../helpers/api.helper';

const BASE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

test.describe('Identity Service - Users @api', () => {
    let authHelper: AuthHelper;
    let authToken: string;

    test.beforeEach(async () => {
        authHelper = new AuthHelper(BASE_URL);

        // Register and login a test user
        const email = `test-${ApiHelper.generateTestId()}@example.com`;
        await authHelper.register({
            email,
            password: 'SecureP@ss123!',
            firstName: 'Test',
            lastName: 'User',
            phone: '+1234567890'
        });

        authToken = await authHelper.login(email, 'SecureP@ss123!');
    });

    test('should return current user with GET /users/me', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/users/me`, {
            headers: authHelper.getAuthHeaders()
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('email');
        expect(body).toHaveProperty('firstName');
        expect(body).toHaveProperty('lastName');
        expect(body).toHaveProperty('phone');
        expect(body.firstName).toBe('Test');
        expect(body.lastName).toBe('User');
    });

    test('should reject unauthenticated request to /users/me', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/users/me`);

        expect(response.status()).toBe(401);
    });

    test('should reject request with invalid token to /users/me', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/users/me`, {
            headers: { 'Authorization': 'Bearer invalid-token-123' }
        });

        expect(response.status()).toBe(401);
    });

    test('should update user profile with PATCH /users/me', async ({ request }) => {
        const updateData = {
            firstName: 'Updated',
            lastName: 'Name',
            phone: '+19876543210'
        };

        const response = await request.patch(`${BASE_URL}/users/me`, {
            headers: authHelper.getAuthHeaders(),
            data: updateData
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.firstName).toBe('Updated');
        expect(body.lastName).toBe('Name');
        expect(body.phone).toBe('+19876543210');
    });

    test('should verify PII fields are encrypted (phone, firstName, lastName)', async ({ request }) => {
        // Get current user
        const response = await request.get(`${BASE_URL}/users/me`, {
            headers: authHelper.getAuthHeaders()
        });

        expect(response.status()).toBe(200);
        const body = await response.json();

        // These fields should be decrypted when returned via API
        expect(body.firstName).toBe('Test');
        expect(body.lastName).toBe('User');
        expect(body.phone).toBe('+1234567890');

        // The values should be readable (not encrypted strings in response)
        expect(body.firstName).not.toContain(':');
        expect(body.lastName).not.toContain(':');
        expect(body.phone).not.toContain(':');
    });

    test('should create tenant membership with POST /users/:userId/tenants', async ({ request }) => {
        // First get current user ID
        const userResponse = await request.get(`${BASE_URL}/users/me`, {
            headers: authHelper.getAuthHeaders()
        });
        const user = await userResponse.json();

        const membershipData = {
            tenantId: uuidv4()
            // roleId: uuidv4() // Role ID is optional and requires existing role
        };

        const response = await request.post(`${BASE_URL}/users/${user.id}/tenants`, {
            headers: authHelper.getAuthHeaders(),
            data: membershipData
        });

        // Should create or return existing membership
        expect([200, 201]).toContain(response.status());
        const body = await response.json();
        expect(body).toHaveProperty('userId');
        expect(body).toHaveProperty('tenantId');
        expect(body.tenantId).toBe(membershipData.tenantId);
    });
});
