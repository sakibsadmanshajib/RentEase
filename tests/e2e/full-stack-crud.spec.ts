import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3002';

test.describe('Full Stack CRUD E2E', () => {
    let authHelper: AuthHelper;
    const landlordData = {
        email: `landlord-crud-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Landlord',
        lastName: 'CRUD'
    };

    test.beforeAll(async ({ request }) => {
        authHelper = new AuthHelper('http://localhost:4000');
        await authHelper.register({
            ...landlordData,
            phone: '555-0123'
        });
    });

    test('Landlord can perform CRUD on Properties, Tenants, Leases, and Invoices', async ({ page }) => {
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // 1. Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);

        // 2. Property CRUD
        await page.click('a[href="/dashboard/properties"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/properties`);
        
        // Create Property
        await page.click('button:has-text("Add Property")');
        await page.fill('input[id="name"]', 'Test Property');
        await page.fill('input[id="address"]', '123 Test St');
        await page.click('button:has-text("Create Property")');
        await expect(page.locator('text=Test Property').first()).toBeVisible();

        // Edit Property
        await page.click('button:has-text("Edit")');
        await page.fill('input[id="edit-name"]', 'Updated Property');
        await page.click('button:has-text("Update Property")');
        await expect(page.locator('text=Updated Property').first()).toBeVisible();

        // Delete Property (Handle confirm dialog)
        page.on('dialog', dialog => dialog.accept());
        await page.click('button:has-text("Delete")');
        await expect(page.locator('text=Updated Property')).not.toBeVisible();


        // 3. Tenant CRUD
        await page.click('a[href="/dashboard/tenants"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/tenants`);

        // Create Tenant
        await page.click('button:has-text("Add Tenant")');
        await page.fill('input[id="firstName"]', 'John');
        await page.fill('input[id="lastName"]', 'Doe');
        await page.fill('input[id="email"]', 'john.doe@example.com');
        await page.fill('input[id="phone"]', '555-0123');
        await page.click('button:has-text("Create Tenant")');
        await expect(page.locator('text=John Doe').first()).toBeVisible();

        // Edit Tenant
        await page.click('button:has-text("Edit")');
        await page.fill('input[id="edit-firstName"]', 'Jane');
        await page.click('button:has-text("Update Tenant")');
        await expect(page.locator('text=Jane Doe').first()).toBeVisible();

        // Delete Tenant
        await page.click('button:has-text("Delete")');
        await expect(page.locator('text=Jane Doe')).not.toBeVisible();


        // 4. Lease CRUD
        await page.click('a[href="/dashboard/leases"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/leases`);

        // Create Lease
        await page.click('button:has-text("Create Lease")');
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
        await page.fill('input[id="startDate"]', startDate);
        await page.fill('input[id="endDate"]', endDate);
        await page.fill('input[id="rentAmount"]', '1000');
        await page.click('button:has-text("Create Lease")');
        await expect(page.locator('text=$1000').first()).toBeVisible();

        // Edit Lease
        await page.click('button:has-text("Edit")');
        await page.fill('input[id="edit-rentAmount"]', '1200');
        await page.click('button:has-text("Update Lease")');
        await expect(page.locator('text=$1200').first()).toBeVisible();

        // Delete Lease
        await page.click('button:has-text("Delete")');
        await expect(page.locator('text=$1200')).not.toBeVisible();


        // 5. Billing CRUD
        await page.click('a[href="/dashboard/billing"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/billing`);

        // Create Invoice
        await page.click('button:has-text("Create Invoice")');
        await page.fill('input[id="amount"]', '500');
        await page.fill('input[id="description"]', 'Utility Bill');
        const dueDate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0];
        await page.fill('input[id="dueDate"]', dueDate);
        await page.click('button:has-text("Create Invoice")');
        await expect(page.locator('text=Utility Bill').first()).toBeVisible();

        // Edit Invoice
        await page.click('button:has-text("Edit")');
        await page.fill('input[id="edit-amount"]', '550');
        await page.click('button:has-text("Update Invoice")');
        await expect(page.locator('text=$550.00').first()).toBeVisible();

        // Delete Invoice
        await page.click('button:has-text("Delete")');
        await expect(page.locator('text=Utility Bill')).not.toBeVisible();
    });
});
