import { test, expect, request as playwrightRequest } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { ApiHelper } from '../../helpers/api.helper';

function readCookie(setCookieHeader: string | string[] | undefined, name: string): string | undefined {
    if (!setCookieHeader) {
        return undefined;
    }
    const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const header of headers) {
        const match = header.match(new RegExp(`${name}=([^;]+)`));
        if (match?.[1]) {
            return match[1];
        }
    }
    return undefined;
}

const BASE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

test.describe('Identity Service - Authentication @api', () => {
    let authHelper: AuthHelper;

    test.beforeEach(() => {
        authHelper = new AuthHelper(BASE_URL);
    });

    test('should register a new user successfully', async ({ request }) => {
        const userData = {
            email: `test-${ApiHelper.generateTestId()}@example.com`,
            password: 'SecureP@ss123!',
            firstName: 'Test',
            lastName: 'User',
            phone: '+1234567890'
        };

        const response = await request.post(`${BASE_URL}/auth/register`, {
            data: userData
        });

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body.email).toBe(userData.email);
        expect(body.firstName).toBe(userData.firstName);
        expect(body.lastName).toBe(userData.lastName);
        // Password should not be returned
        expect(body).not.toHaveProperty('password');
        expect(body).not.toHaveProperty('passwordHash');
    });

    test.skip('should reject registration with invalid email', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/auth/register`, {
            data: {
                email: 'invalid-email',
                password: 'SecureP@ss123!',
                firstName: 'Test',
                lastName: 'User',
                phone: '+1234567890'
            }
        });

        expect(response.status()).toBe(400);
    });

    test.skip('should reject registration with weak password', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/auth/register`, {
            data: {
                email: `test-${ApiHelper.generateTestId()}@example.com`,
                password: '123', // Too weak
                firstName: 'Test',
                lastName: 'User',
                phone: '+1234567890'
            }
        });

        expect(response.status()).toBe(400);
    });

    test('should login with valid credentials', async ({ request }) => {
        // First register a user
        const email = `test-${ApiHelper.generateTestId()}@example.com`;
        const password = 'SecureP@ss123!';

        await authHelper.register({
            email,
            password,
            firstName: 'Test',
            lastName: 'User',
            phone: '+1234567890'
        });

        // Then login
        const response = await request.post(`${BASE_URL}/auth/login`, {
            data: { email, password }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('message', 'Login successful');

        const accessToken = readCookie(response.headers()['set-cookie'], 'accessToken');
        const refreshToken = readCookie(response.headers()['set-cookie'], 'refreshToken');
        expect(accessToken).toBeTruthy();
        expect(refreshToken).toBeTruthy();
    });

    test('should reject login with invalid credentials', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/auth/login`, {
            data: {
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            }
        });

        expect(response.status()).toBe(401);
    });

    test('should reject login with invalid password for existing user', async ({ request }) => {
        // First register a user
        const email = `test-${ApiHelper.generateTestId()}@example.com`;
        await authHelper.register({
            email,
            password: 'CorrectPassword123!',
            firstName: 'Test',
            lastName: 'User',
            phone: '+1234567890'
        });

        // Then login with wrong password
        const response = await request.post(`${BASE_URL}/auth/login`, {
            data: {
                email,
                password: 'WrongPassword123!'
            }
        });

        expect(response.status()).toBe(401);
    });

    test('should prevent duplicate email registration', async ({ request }) => {
        const email = `test-${ApiHelper.generateTestId()}@example.com`;
        const userData = {
            email,
            password: 'SecureP@ss123!',
            firstName: 'Test',
            lastName: 'User',
            phone: '+1234567890'
        };

        // First registration should succeed
        const firstResponse = await request.post(`${BASE_URL}/auth/register`, {
            data: userData
        });
        expect(firstResponse.status()).toBe(201);

        // Second registration with same email should fail (use a fresh context so CSRF cookies from the first request are not sent)
        const isolatedRequest = await playwrightRequest.newContext();
        const secondResponse = await isolatedRequest.post(`${BASE_URL}/auth/register`, {
            data: userData
        });
        await isolatedRequest.dispose();
        expect(secondResponse.status()).toBe(409);
    });
});
