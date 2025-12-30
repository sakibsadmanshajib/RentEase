import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

test.describe('Lease CRUD E2E', () => {
    let authHelper: AuthHelper;
    let landlordData: any;
    let tenantId: string;

    test.beforeAll(async ({ request }) => {
        authHelper = new AuthHelper('http://localhost:4000');
        landlordData = {
            email: `landlord-lease-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Landlord',
            lastName: 'Lease',
            phone: '555-0123'
        };
        await authHelper.register(landlordData);
        // Login and create tenant to bypass onboarding
        await authHelper.login(landlordData.email, landlordData.password);
        const tenant = await authHelper.createTenant('Lease Test Org');
        tenantId = tenant.id;
    });

    test('Landlord can create, edit, and delete a lease', async ({ page }) => {
        // Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');
        // Handle potential onboarding redirect
        await page.waitForTimeout(2000); // Wait for potential redirect
        if (page.url().includes('/onboarding')) {
             await page.click('text=Create Organization');
             await page.fill('input[name="name"]', 'Test Organization');
             await page.click('button[type="submit"]');
        }
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);

        // Create Dependencies (Tenant and Property)
        // Get token from localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));

        // Create Property using the authenticated context
        // No need to create a new Tenant Organization
        const propertyRes = await page.request.post(`${WEB_URL.replace('3000', '4000')}/properties`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                name: 'Lease Test Property',
                address: '123 Lease St',
                type: 'Residential',
                units: 1,
                // tenantId is required by DTO
                tenantId: tenantId
            }
        });
        if (!propertyRes.ok()) {
            console.log(`Property creation failed: ${propertyRes.status()} ${await propertyRes.text()}`);
        }
        expect(propertyRes.ok()).toBeTruthy();
        const property = await propertyRes.json();
        const propertyId = property.id;
        
        // Navigate to Leases (trigger fetch)
        await page.click('a[href="/dashboard/leases"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/leases`);

        // Create Lease
        await page.click('button:has-text("Create Lease")');
        await expect(page.locator('text=Create New Lease')).toBeVisible();
        
        const startDate = '2025-01-01';
        const endDate = '2025-12-31';
        const rentAmount = Math.floor(Math.random() * 10000).toString();

        await page.fill('input[id="startDate"]', startDate);
        await page.fill('input[id="endDate"]', endDate);
        await page.fill('input[id="rentAmount"]', rentAmount);
        await page.fill('input[id="rentAmount"]', rentAmount);
        
        // Select Property from dropdown
        // Wait for the option to appear (fetch completion)
        await page.locator(`select[id="propertyId"] option[value="${propertyId}"]`).waitFor({ state: 'attached', timeout: 5000 });
        await page.selectOption('select[id="propertyId"]', propertyId);
        
        // tenantId is handled by context, no input to fill

        await page.click('button[type="submit"]');

        // Verify creation
        await expect(page.locator(`text=$${rentAmount}`)).toBeVisible();

        // Edit Lease
        await page.locator('.bg-card').filter({ hasText: `$${rentAmount}` }).first().locator('button:has-text("Edit")').click();
        await expect(page.locator('text=Edit Lease')).toBeVisible();
        
        const newRentAmount = (parseInt(rentAmount) + 100).toString();
        await page.fill('input[id="edit-rentAmount"]', newRentAmount);
        await page.click('button:has-text("Update Lease")');

        // Verify edit
        await expect(page.locator(`text=$${newRentAmount}`)).toBeVisible();

        // Delete Lease
        page.once('dialog', dialog => dialog.accept());
        await page.locator('.bg-card').filter({ hasText: `$${newRentAmount}` }).first().locator('button:has-text("Delete")').click();
        
        // Wait for the fetchLeases call to complete
        await page.waitForResponse(response => response.url().includes('/leases') && response.request().method() === 'GET' && response.status() === 200);

        await expect(page.locator(`text=$${newRentAmount}`)).not.toBeVisible();
    });
});
