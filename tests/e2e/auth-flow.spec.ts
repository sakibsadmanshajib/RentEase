import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

test.describe('Authentication Flow E2E', () => {
    let authHelper: AuthHelper;
    const landlordData = {
        email: `auth-flow-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Auth',
        lastName: 'Flow',
        phone: '555-0199'
    };

    test.beforeAll(async () => {
        authHelper = new AuthHelper('http://localhost:4000');
        // We will register dynamically in the "Sign Up" test, 
        // but for Login test we might need a pre-existing user if we want them separate.
        // For simplicity, let's keep tests independent or sequential. 
        // Let's make "Sign Up" the first test, and "Login" use a fresh user or the same one.
    });

    test('User can Sign Up as a Landlord', async ({ page }) => {
        const uniqueEmail = `signup-${Date.now()}@example.com`;
        
        await page.goto(`${WEB_URL}/auth/register`);
        await page.waitForLoadState('networkidle');
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirm-password"]', 'Password123!');
        
        await page.click('button[type="submit"]');

        // After registration, app redirects to login page (no auto-login)
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('User can Login with valid credentials', async ({ page }) => {
        // Register a user strictly for this test to avoid collision
        const loginUser = {
            ...landlordData,
            email: `login-test-${Date.now()}@example.com`
        };
        await authHelper.register(loginUser);

        await page.goto(`${WEB_URL}/auth/login`);
        await page.waitForLoadState('networkidle');
        await page.fill('input[name="email"]', loginUser.email);
        await page.fill('input[name="password"]', loginUser.password);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);
    });

    test('User receives error with invalid credentials', async ({ page }) => {
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'WrongPass!');
        await page.click('button[type="submit"]');

        // Expect an error message
        await expect(page.locator('text=Invalid credentials')).toBeVisible(); 
        // Note: The exact error text depends on the implementation. 
        // If this fails, I'll need to check the actual error message.
    });

    test('User can Logout', async ({ page }) => {
        // Register and Login first
        const logoutUser = {
            ...landlordData,
            email: `logout-test-${Date.now()}@example.com`
        };
        await authHelper.register(logoutUser);

        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', logoutUser.email);
        await page.fill('input[name="password"]', logoutUser.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);

        // Perform Logout - click the user menu button (has data-testid)
        await page.click('[data-testid="user-menu"]');
        // Wait for dropdown menu to appear and click Log out
        await page.getByText('Log out').click();

        await expect(page).toHaveURL(`${WEB_URL}/auth/login`);
    });
});
