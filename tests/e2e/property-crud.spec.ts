import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

test.describe('Property CRUD E2E', () => {
    let authHelper: AuthHelper;
    let landlordData: any;

    test.beforeAll(async ({ request }) => {
        authHelper = new AuthHelper('http://localhost:4000');
        landlordData = {
            email: `landlord-prop-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Landlord',
            lastName: 'Property',
            phone: '555-0123'
        };
        await authHelper.register(landlordData);
        // Login and create tenant to bypass onboarding
        await authHelper.login(landlordData.email, landlordData.password);
        await authHelper.createTenant('Property Test Org');
    });

    test('Landlord can create, edit, and delete a property', async ({ page }) => {
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
        const timestamp = Date.now();
        const propertyName = `Unique Property ${timestamp}`;
        const updatedPropertyName = `Updated Unique Property ${timestamp}`;

        // Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');
        // Tenant already created in beforeAll - wait for dashboard
        await page.waitForURL(`${WEB_URL}/dashboard`, { timeout: 10000 });
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);

        // Navigate to Properties
        await page.click('a[href="/dashboard/properties"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/properties`);

        // Create Property
        await page.click('button:has-text("Add Property")');
        await page.fill('input[id="name"]', propertyName);
        await page.fill('input[id="address"]', '123 Test St');
        await page.click('button:has-text("Create Property")');
        await expect(page.locator(`text=${propertyName}`).first()).toBeVisible();

        // Edit Property
        // Find the card with the property name and click Edit inside it
        await page.locator('.bg-card').filter({ hasText: propertyName }).locator('button:has-text("Edit")').click();
        await page.fill('input[id="edit-name"]', updatedPropertyName);
        await page.click('button:has-text("Update Property")');
        await expect(page.locator(`text=${updatedPropertyName}`).first()).toBeVisible();

        // Delete Property
        page.on('dialog', dialog => dialog.accept());
        // Wait for delete API response
        const [deleteResponse] = await Promise.all([
            page.waitForResponse(response => 
                response.url().includes('/properties') && 
                response.request().method() === 'DELETE' &&
                response.status() === 200
            ),
            page.locator('.bg-card').filter({ hasText: updatedPropertyName }).locator('button:has-text("Delete")').click()
        ]);
        await expect(page.locator(`text=${updatedPropertyName}`)).not.toBeVisible();
    });
});
