import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

test.describe('Lease CRUD E2E', () => {
    let authHelper: AuthHelper;
    let landlordData: any;

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
    });

    test('Landlord can create, edit, and delete a lease', async ({ page }) => {
        // Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);

        // Navigate to Leases
        await page.click('a[href="/dashboard/leases"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/leases`);

        // Create Dependencies (Tenant and Property)
        // Get token from localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));

        const tenantRes = await page.request.post(`${WEB_URL.replace('3000', '4000')}/tenants`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                firstName: 'Lease',
                lastName: 'Tenant',
                email: `lease-tenant-${Date.now()}@example.com`,
                phone: '555-0123'
            }
        });
        const tenant = await tenantRes.json();
        const tenantId = tenant.id;

        const propertyRes = await page.request.post(`${WEB_URL.replace('3000', '4000')}/properties`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                name: 'Lease Test Property',
                address: '123 Lease St',
                type: 'Residential',
                units: 1,
                tenantId: tenantId
            }
        });
        const property = await propertyRes.json();
        const propertyId = property.id;

        // Create Lease
        await page.click('button:has-text("Create Lease")');
        await expect(page.locator('text=Create New Lease')).toBeVisible();
        
        const startDate = '2025-01-01';
        const endDate = '2025-12-31';
        const rentAmount = Math.floor(Math.random() * 10000).toString();

        await page.fill('input[id="startDate"]', startDate);
        await page.fill('input[id="endDate"]', endDate);
        await page.fill('input[id="rentAmount"]', rentAmount);
        await page.fill('input[id="propertyId"]', propertyId);
        await page.fill('input[id="tenantId"]', tenantId);
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
