import { test, expect } from '@playwright/test';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';

test.describe('Google Auth Integration', () => {

  test('Login page has Google Sign In button', async ({ page }) => {
    await page.goto(`${WEB_URL}/auth/login`);
    const googleBtn = page.locator('button', { hasText: 'Google' });
    await expect(googleBtn).toBeVisible();
  });

  test('Auth Callback handles cookies and redirects Tenant', async ({ page }) => {
    // Mock the profile request that the frontend makes via checkAuthStatus()
    // The callback page now uses /auth/me (cookie-based) instead of token in URL
    await page.route(`**/auth/me`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'user-123',
                email: 'tenant@example.com',
                roles: [],
                orgId: 'tenant-1'
            })
        });
    });

    // Navigate to callback without token - auth is via HTTP-only cookies
    await page.goto(`${WEB_URL}/auth/callback`);

    // Should redirect to dashboard or onboarding
    await page.waitForURL(/.*\/(dashboard|onboarding)/, { timeout: 15000 });
  });

  test('Auth Callback handles cookies and redirects Admin', async ({ page }) => {
    // Mock the profile request
    await page.route(`**/auth/me`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'user-456',
                email: 'admin@example.com',
                roles: [{ name: 'Admin' }],
                orgId: null
            })
        });
    });

    // Navigate to callback without token - auth is via HTTP-only cookies
    await page.goto(`${WEB_URL}/auth/callback`);

    // Should redirect to admin
    await page.waitForURL(/.*\/admin/, { timeout: 15000 });
  });

    test('Auth Callback handles cookies and redirects Landlord (Default)', async ({ page }) => {
    // Mock the profile request
    await page.route(`**/auth/me`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'user-789',
                email: 'landlord@example.com',
                roles: [], // No specific roles
                orgId: null
            })
        });
    });

    // Navigate to callback without token - auth is via HTTP-only cookies
    await page.goto(`${WEB_URL}/auth/callback`);

    // Should redirect to dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
  });
});

