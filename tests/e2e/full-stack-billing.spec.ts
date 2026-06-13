import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api.helper';
import { AuthHelper } from '../helpers/auth.helper';
import { API_GATEWAY_URL, IDENTITY_SERVICE_URL, WEB_URL } from '../helpers/test-env';

test.describe('Full Stack Billing E2E', () => {
    let landlordAuth: AuthHelper;
    let landlordData: any;

    test.beforeAll(async () => {
        // 1. Register Landlord via API (use API Gateway for tenant creation)
        landlordAuth = new AuthHelper(IDENTITY_SERVICE_URL);
        landlordData = {
            email: `landlord-${ApiHelper.generateTestId()}@example.com`,
            password: 'Password123!',
            firstName: 'John',
            lastName: 'Landlord',
            phone: '+15550001111'
        };
        await landlordAuth.register(landlordData);
        await landlordAuth.login(landlordData.email, landlordData.password);
        // Create tenant to bypass onboarding
        await landlordAuth.createTenant('Billing E2E Org');
    });

    test('Landlord can login, create invoice, and see it in the list', async ({ page }) => {
        // 2. Login via UI
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');

        // Verify redirect to dashboard
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);
        
        // 3. Navigate to Billing
        await page.click('a[href="/dashboard/billing"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/billing`);

        // 4. Create Invoice
        const createBtn = page.locator('button:has-text("Create Invoice")');
        await createBtn.waitFor({ state: 'visible' });
        await createBtn.click();
        
        // Fill dialog
        await page.fill('input[id="amount"]', '1200');
        await page.fill('input[id="description"]', 'Rent for January');
        
        // Set date (simple string format YYYY-MM-DD for date input)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await page.fill('input[id="dueDate"]', dateStr);

        await page.click('button[type="submit"]');

        // 5. Verify Invoice appears
        // Wait for the card to appear
        await expect(page.locator('text=Rent for January').first()).toBeVisible();
        await expect(page.locator('text=$1200.00').first()).toBeVisible();
        await expect(page.locator('text=PENDING').first()).toBeVisible();
    });
});
