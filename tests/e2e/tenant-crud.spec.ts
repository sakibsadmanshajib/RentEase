import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

test.describe('Tenant CRUD E2E', () => {
    let authHelper: AuthHelper;
    let landlordData: any;

    test.beforeAll(async ({ request }) => {
        authHelper = new AuthHelper('http://localhost:4000');
        landlordData = {
            email: `landlord-tenant-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Landlord',
            lastName: 'Tenant',
            phone: '555-0123'
        };
        await authHelper.register(landlordData);
    });

    test('Landlord can create, edit, and delete a tenant', async ({ page }) => {
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
        const timestamp = Date.now();
        const tenantFirstName = `TestTenantFirst${timestamp}`;
        const tenantLastName = `TestTenantLast${timestamp}`;
        const updatedTenantFirstName = `UpdatedTenantFirst${timestamp}`;

        // Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);

        // Navigate to Tenants
        await page.click('a[href="/dashboard/tenants"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/tenants`);

        // Create Tenant
        await page.click('button:has-text("Add Tenant")');
        await page.fill('input[id="firstName"]', tenantFirstName);
        await page.fill('input[id="lastName"]', tenantLastName);
        await page.fill('input[id="email"]', `tenant${timestamp}@example.com`);
        await page.fill('input[id="phone"]', '555-0123');
        await page.click('button:has-text("Create Tenant")');
        await expect(page.locator(`text=${tenantFirstName}`).first()).toBeVisible();

        // Edit Tenant
        await page.locator('.bg-card').filter({ hasText: tenantFirstName }).locator('button:has-text("Edit")').click();
        await page.fill('input[id="edit-firstName"]', updatedTenantFirstName);
        await page.click('button:has-text("Update Tenant")');
        await expect(page.locator(`text=${updatedTenantFirstName}`).first()).toBeVisible();

        // Delete Tenant
        page.once('dialog', dialog => dialog.accept());
        await page.locator('.bg-card').filter({ hasText: updatedTenantFirstName }).locator('button:has-text("Delete")').click();
        
        // Wait for the fetchTenants call to complete
        await page.waitForResponse(response => response.url().includes('/tenants') && response.request().method() === 'GET' && response.status() === 200);
        
        await expect(page.locator(`text=${updatedTenantFirstName}`)).not.toBeVisible();
    });
});
