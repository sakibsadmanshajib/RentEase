import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { randomUUID } from 'crypto';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

// Run this test serially to avoid resource contention
test.describe.configure({ mode: 'serial' });

// Note: This test requires fresh browser state for reliable execution
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
        // Login and create tenant to bypass onboarding
        await authHelper.login(landlordData.email, landlordData.password);
        await authHelper.createTenant('Billing Test Org');
    });

    test('Landlord can create, edit, and delete an invoice', async ({ page }) => {
        // Increase timeout for this UI-heavy test
        test.setTimeout(60000);

        // Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.waitForLoadState('networkidle');
        await page.fill('input[name="email"]', landlordData.email);
        await page.fill('input[name="password"]', landlordData.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|dashboard\/onboarding)/, { timeout: 15000 });

        // Handle potential onboarding redirect
        if (page.url().includes('/onboarding')) {
             await page.click('text=Create Organization');
             await page.fill('input[name="name"]', 'Test Organization');
             await page.click('button[type="submit"]');
             await page.waitForURL(`${WEB_URL}/dashboard`);
        }

        // Navigate to Billing
        await page.click('a[href="/dashboard/billing"]');
        await expect(page).toHaveURL(`${WEB_URL}/dashboard/billing`);
        await page.waitForLoadState('networkidle');

        // Get token from localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBeTruthy();

        // Use test UUIDs for dependencies - the billing service accepts these without validation
        // This simplifies the test to focus on invoice CRUD in the UI
        const tenantId = randomUUID();
        const leaseId = randomUUID();

        // Create Invoice via UI
        await page.click('button:has-text("Create Invoice")');
        await expect(page.locator('text=Create New Invoice')).toBeVisible();

        // Use a unique amount to identify this invoice
        const amount = (7000 + Math.floor(Math.random() * 1000)).toString();
        const dueDate = '2025-02-01';

        await page.fill('input[id="amount"]', amount);
        await page.fill('input[id="description"]', `Invoice ${amount}`);
        await page.fill('input[id="dueDate"]', dueDate);
        // tenantId is handled by context, no input to fill
        
        // leaseId is a select now, and optional. Since we haven't created a lease, we can skip selecting it.
        // Or check if the select exists.
        await expect(page.locator('select[id="leaseId"]')).toBeVisible();

        // Wait for invoice creation API response before clicking submit
        const [createResponse] = await Promise.all([
            page.waitForResponse(response => response.url().includes('/invoices') && response.request().method() === 'POST', { timeout: 10000 }),
            page.click('button[type="submit"]')
        ]);
        expect(createResponse.status()).toBe(201);
        
        // Wait for the invoice list to refresh after creation
        await page.waitForResponse(response => 
            response.url().includes('/invoices') && 
            response.request().method() === 'GET' &&
            response.status() === 200
        );
        
        // Verify creation by checking for the formatted amount
        const formattedAmount = `$${Number(amount).toFixed(2)}`;
        await expect(page.locator(`text=${formattedAmount}`).first()).toBeVisible({ timeout: 10000 });

        // Edit Invoice - target by amount
        await page.locator('.bg-card').filter({ hasText: formattedAmount }).first().locator('button:has-text("Edit")').click();
        await expect(page.locator('text=Edit Invoice')).toBeVisible();
        
        const newAmount = (Number(amount) + 50).toString();
        await page.fill('input[id="edit-amount"]', newAmount);
        await page.click('button:has-text("Update Invoice")');
        
        // Verify edit
        const newFormattedAmount = `$${Number(newAmount).toFixed(2)}`;
        await expect(page.locator(`text=${newFormattedAmount}`).first()).toBeVisible();

        // Delete Invoice
        page.once('dialog', dialog => dialog.accept());
        // Use Promise.all to avoid race condition
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/invoices') && response.request().method() === 'DELETE'),
            page.locator('.bg-card').filter({ hasText: newFormattedAmount }).first().locator('button:has-text("Delete")').click()
        ]);

        await expect(page.locator(`text=${newFormattedAmount}`)).not.toBeVisible();
    });
});
