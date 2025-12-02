import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3002';

test.describe('Billing CRUD E2E', () => {
    let authHelper: AuthHelper;
    let landlordData: any;

    test.beforeAll(async ({ request }) => {
        authHelper = new AuthHelper('http://localhost:4000');
        landlordData = {
            email: `landlord-billing-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Landlord',
            lastName: 'Billing',
            phone: '555-0123'
        };
        await authHelper.register(landlordData);
    });

    test('Landlord can create, edit, and delete an invoice', async ({ page }) => {
        // Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard`);

        // Navigate to Billing
        await page.click('a[href="/dashboard/billing"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/billing`);

        // Create Dependencies (Tenant, Property, Lease)
        const tenantRes = await page.request.post(`${WEB_URL.replace('3002', '4000')}/tenants`, {
            data: {
                firstName: 'Billing',
                lastName: 'Tenant',
                email: `billing-tenant-${Date.now()}@example.com`,
                phone: '555-0123'
            }
        });
        const tenant = await tenantRes.json();
        const tenantId = tenant.id;

        const propertyRes = await page.request.post(`${WEB_URL.replace('3002', '4000')}/properties`, {
            data: {
                name: 'Billing Test Property',
                address: '123 Billing St',
                type: 'Commercial',
                units: 1,
                tenantId: tenantId
            }
        });
        const property = await propertyRes.json();
        const propertyId = property.id;

        const leaseRes = await page.request.post(`${WEB_URL.replace('3002', '4000')}/leases`, {
            data: {
                startDate: '2025-01-01',
                endDate: '2025-12-31',
                rentAmount: 2000,
                propertyId: propertyId,
                tenantId: tenantId
            }
        });
        const lease = await leaseRes.json();
        const leaseId = lease.id;

        // Create Invoice
        await page.click('button:has-text("Create Invoice")');
        await expect(page.locator('text=Create New Invoice')).toBeVisible();

        const amount = Math.floor(Math.random() * 1000).toString();
        const description = `Invoice ${amount}`;
        const dueDate = '2025-02-01';

        await page.fill('input[id="amount"]', amount);
        await page.fill('input[id="description"]', description);
        await page.fill('input[id="dueDate"]', dueDate);
        await page.fill('input[id="tenantId"]', tenantId);
        await page.fill('input[id="leaseId"]', leaseId);
        await page.click('button[type="submit"]');
        
        // Verify creation
        await expect(page.locator(`text=${description}`).first()).toBeVisible();
        await expect(page.locator(`text=$${Number(amount).toFixed(2)}`).first()).toBeVisible();

        // Edit Invoice
        await page.locator('.bg-card').filter({ hasText: description }).first().locator('button:has-text("Edit")').click();
        await expect(page.locator('text=Edit Invoice')).toBeVisible();
        
        const newAmount = (Number(amount) + 50).toString();
        await page.fill('input[id="edit-amount"]', newAmount);
        await page.click('button:has-text("Update Invoice")');
        
        // Verify edit
        await expect(page.locator(`text=$${Number(newAmount).toFixed(2)}`).first()).toBeVisible();

        // Delete Invoice
        page.once('dialog', dialog => dialog.accept());
        await page.locator('.bg-card').filter({ hasText: `$${Number(newAmount).toFixed(2)}` }).first().locator('button:has-text("Delete")').click();
        
        // Wait for fetchInvoices
        await page.waitForResponse(response => response.url().includes('/invoices') && response.request().method() === 'GET' && response.status() === 200);

        await expect(page.locator(`text=$${Number(newAmount).toFixed(2)}`)).not.toBeVisible();
    });
});
