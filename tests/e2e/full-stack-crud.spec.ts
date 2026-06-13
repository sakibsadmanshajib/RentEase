import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { IDENTITY_SERVICE_URL } from '../helpers/test-env';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

// Run this test serially to avoid resource contention
test.describe.configure({ mode: 'serial' });

test.describe('Full Stack CRUD E2E', () => {
    let authHelper: AuthHelper;
    const landlordData = {
        email: `landlord-crud-${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Landlord',
        lastName: 'CRUD'
    };

    let tenantId: string;

    test.beforeAll(async ({ request }) => {
        authHelper = new AuthHelper(IDENTITY_SERVICE_URL);
        await authHelper.register({
            ...landlordData,
            phone: '555-0123'
        });
        // Login and create tenant to bypass onboarding
        await authHelper.login(landlordData.email, landlordData.password);
        const tenant = await authHelper.createTenant('Full Stack Test Org');
        tenantId = tenant.id;
    });

    test('Landlord can perform CRUD on Properties, Tenants, Leases, and Invoices', async ({ page }) => {
        // Increase timeout for this comprehensive multi-entity test
        test.setTimeout(180000);
        
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.waitForLoadState('networkidle');
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);
        await page.waitForLoadState('networkidle');

        // 2. Property CRUD
        // Handle potential onboarding redirect checking
        if (page.url().includes('/onboarding')) {
             await page.click('text=Create Organization');
             await page.fill('input[name="name"]', 'Test Organization');
             await page.click('button[type="submit"]');
             await page.waitForURL(`${WEB_URL}/dashboard`, { timeout: 10000 });
        }

        await page.click('a[href="/dashboard/properties"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/properties`);
        await page.waitForLoadState('networkidle');
        
        // Create Property
        const propertyName = `Test Property ${Date.now()}`;
        await page.click('button:has-text("Add Property")');
        await page.fill('input[id="name"]', propertyName);
        await page.fill('input[id="address"]', '123 Test St');
        await page.click('button:has-text("Create Property")');
        await expect(page.locator(`text=${propertyName}`).first()).toBeVisible();

        // Edit Property - target the specific property card
        const updatedPropertyName = `Updated Property ${Date.now()}`;
        const propertyCard = page.locator('.bg-card, [class*="card"]').filter({ hasText: propertyName });
        await propertyCard.locator('button:has-text("Edit")').click();
        await page.fill('input[id="edit-name"]', updatedPropertyName);
        await page.click('button:has-text("Update Property")');
        await expect(page.locator(`text=${updatedPropertyName}`).first()).toBeVisible();

        // Delete Property - target the specific property card
        const updatedPropertyCard = page.locator('.bg-card, [class*="card"]').filter({ hasText: updatedPropertyName });
        page.once('dialog', dialog => dialog.accept());
        // Use Promise.all to wait for response while clicking to avoid race condition
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/properties') && response.request().method() === 'DELETE'),
            updatedPropertyCard.locator('button:has-text("Delete")').click()
        ]);
        // Wait for React to re-render after delete
        await expect(page.locator(`text=${updatedPropertyName}`)).not.toBeVisible({ timeout: 10000 });


        // 3. Tenant CRUD (Real API)
        await page.click('a[href="/dashboard/all-tenants"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/all-tenants`);
        await page.waitForLoadState('networkidle');

        // Create Tenant
        const tenantTimestamp = Date.now();
        await page.click('button:has-text("Add Tenant")');
        await page.fill('input[id="firstName"]', `John${tenantTimestamp}`);
        await page.fill('input[id="lastName"]', 'Doe');
        await page.fill('input[id="email"]', `john.doe${tenantTimestamp}@example.com`);
        await page.fill('input[id="phone"]', '555-0123');
        // Submit button in dialog
        await page.locator('button[type="submit"]:has-text("Add Tenant")').click();
        await expect(page.locator(`text=John${tenantTimestamp} Doe`).first()).toBeVisible();

        // Edit Tenant
        const tenantCard = page.locator('.bg-card, [class*="card"]').filter({ hasText: `John${tenantTimestamp}` });
        await tenantCard.locator('button:has-text("Edit")').click();
        await page.fill('input[id="edit-firstName"]', `Jane${tenantTimestamp}`);
        await page.locator('button[type="submit"]:has-text("Update Tenant")').click();
        await expect(page.locator(`text=Jane${tenantTimestamp} Doe`).first()).toBeVisible();

        // Remove Tenant
        const updatedTenantCard = page.locator('.bg-card, [class*="card"]').filter({ hasText: `Jane${tenantTimestamp}` });
        page.once('dialog', dialog => dialog.accept());
        await updatedTenantCard.locator('button:has-text("Remove")').click();
        await expect(page.locator(`text=Jane${tenantTimestamp} Doe`)).not.toBeVisible({ timeout: 10000 });


        // 4. Lease CRUD - Now working with proper dependency creation and selectors
        // Create dependencies (Property) via API first
        const leaseTimestamp = Date.now();
        
        // No need to create Tenant Organization, use context
        // Cookies are shared with page.request
        
        const propertyRes = await page.request.post(`${WEB_URL.replace('3000', '4000')}/properties`, {
            data: {
                name: `Lease Property ${leaseTimestamp}`,
                address: '123 Lease St',
                type: 'Residential',
                units: 1
            }
        });
        expect(propertyRes.ok()).toBeTruthy();
        const property = await propertyRes.json();
        const propertyId = property.id;
        
        // Navigate to Leases (trigger fetch)
        await page.click('a[href="/dashboard/leases"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/leases`);
        await page.waitForLoadState('networkidle');

        // Create Lease
        await page.click('button:has-text("Create Lease")');
        await expect(page.locator('text=Create New Lease')).toBeVisible();
        
        const rentAmount = Math.floor(Math.random() * 10000).toString();
        await page.fill('input[id="startDate"]', '2025-01-01');
        await page.fill('input[id="endDate"]', '2025-12-31');
        await page.fill('input[id="rentAmount"]', rentAmount);
        
        // Select Property from dropdown
        // Wait for the option to appear (fetch completion)
        await page.locator(`select[id="propertyId"] option[value="${propertyId}"]`).waitFor({ state: 'attached', timeout: 5000 });
        await page.selectOption('select[id="propertyId"]', propertyId);
        
        // tenantId is handled by context
        
        await page.click('button[type="submit"]');

        // Verify creation
        await expect(page.locator(`text=$${rentAmount}`)).toBeVisible();

        // Edit Lease - target the specific lease card
        const leaseCard = page.locator('.bg-card, [class*="card"]').filter({ hasText: `$${rentAmount}` });
        await leaseCard.locator('button:has-text("Edit")').click();
        await expect(page.locator('text=Edit Lease')).toBeVisible();
        
        const newRentAmount = (parseInt(rentAmount) + 100).toString();
        await page.fill('input[id="edit-rentAmount"]', newRentAmount);
        await page.click('button:has-text("Update Lease")');

        // Verify edit
        await expect(page.locator(`text=$${newRentAmount}`)).toBeVisible();

        // Delete Lease - target the specific lease card and handle confirm dialog
        const updatedLeaseCard = page.locator('.bg-card, [class*="card"]').filter({ hasText: `$${newRentAmount}` });
        page.once('dialog', dialog => dialog.accept());
        // Use Promise.all to avoid race condition
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/leases') && response.request().method() === 'DELETE'),
            updatedLeaseCard.locator('button:has-text("Delete")').click()
        ]);
        await expect(page.locator(`text=$${newRentAmount}`)).not.toBeVisible({ timeout: 10000 });


        // 5. Billing/Invoice CRUD
        await page.click('a[href="/dashboard/billing"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/billing`);
        await page.waitForLoadState('networkidle');

        // Create Invoice - using API-created tenant context
        await page.click('button:has-text("Create Invoice")');
        await expect(page.locator('text=Create New Invoice')).toBeVisible();
        
        const invoiceAmount = (Math.floor(Math.random() * 1000) + 5000).toString(); // Unique range
        const invoiceDescription = `Invoice ${invoiceAmount}`;
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await page.fill('input[id="amount"]', invoiceAmount);
        await page.fill('input[id="description"]', invoiceDescription);
        await page.fill('input[id="dueDate"]', dueDate);
        
        // Lease selection skipped (optional) and tenantId handled by context
        
        await page.click('button[type="submit"]');

        // Verify creation - look for description
        await expect(page.locator(`text=${invoiceDescription}`).first()).toBeVisible();

        // Edit Invoice - target specific invoice card
        const invoiceCard = page.locator('.bg-card').filter({ hasText: invoiceDescription });
        await invoiceCard.first().locator('button:has-text("Edit")').click();
        await expect(page.locator('text=Edit Invoice')).toBeVisible();
        
        const newInvoiceAmount = (parseInt(invoiceAmount) + 50).toString();
        await page.fill('input[id="edit-amount"]', newInvoiceAmount);
        await page.click('button:has-text("Update Invoice")');

        // Verify edit - look for formatted amount
        const newFormattedAmount = `$${Number(newInvoiceAmount).toFixed(2)}`;
        await expect(page.locator(`text=${newFormattedAmount}`).first()).toBeVisible();

        // Delete Invoice - target specific invoice card and handle confirm dialog
        const updatedInvoiceCard = page.locator('.bg-card').filter({ hasText: newFormattedAmount });
        page.once('dialog', dialog => dialog.accept());
        // Use Promise.all to avoid race condition
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/invoices') && response.request().method() === 'DELETE'),
            updatedInvoiceCard.first().locator('button:has-text("Delete")').click()
        ]);
        await expect(page.locator(`text=${newFormattedAmount}`)).not.toBeVisible({ timeout: 10000 });
    });
});
