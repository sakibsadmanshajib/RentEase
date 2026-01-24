import { test, expect } from '@playwright/test';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';

test.describe('Google Auth Integration', () => {

  test('Login page has Google Sign In button', async ({ page }) => {
    await page.goto(`${WEB_URL}/auth/login`);
    const googleBtn = page.locator('button', { hasText: 'Google' });
    await expect(googleBtn).toBeVisible();
  });

  test('Auth Callback handles token and redirects Tenant', async ({ page }) => {
    const mockToken = 'mock_access_token_tenant';

    // Mock the profile request that the frontend makes
    await page.route(`**/users/me`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'user-123',
                email: 'tenant@example.com',
                roles: [],
                tenantMemberships: [{ id: 'mem-1', tenantId: 'tenant-1' }]
            })
        });
    });

    await page.goto(`${WEB_URL}/auth/callback?token=${mockToken}`);

    // Should redirect to dashboard or onboarding
    await page.waitForURL(/.*\/(dashboard|onboarding)/, { timeout: 15000 });
  });

  test('Auth Callback handles token and redirects Admin', async ({ page }) => {
    const mockToken = 'mock_access_token_admin';

    // Mock the profile request
    await page.route(`**/users/me`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'user-456',
                email: 'admin@example.com',
                roles: [{ name: 'Admin' }],
                tenantMemberships: []
            })
        });
    });

    await page.goto(`${WEB_URL}/auth/callback?token=${mockToken}`);

    // Should redirect to admin
    await page.waitForURL(/.*\/admin/, { timeout: 15000 });
  });

    test('Auth Callback handles token and redirects Landlord (Default)', async ({ page }) => {
    const mockToken = 'mock_access_token_landlord';

    // Mock the profile request
    await page.route(`**/users/me`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'user-789',
                email: 'landlord@example.com',
                roles: [], // No specific roles
                tenantMemberships: []
            })
        });
    });

    await page.goto(`${WEB_URL}/auth/callback?token=${mockToken}`);

    // Should redirect to dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
  });
});
