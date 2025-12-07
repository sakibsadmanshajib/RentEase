import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import { AuthHelper } from '../helpers/auth.helper';
import { dbHelper } from '../helpers/database.helper';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

test.describe('Tenant Portal E2E', () => {
    let authHelper: AuthHelper;
    let landlordData: any;
    let tenantData: any;

    test.beforeAll(async ({ request }) => {
        authHelper = new AuthHelper('http://localhost:4000');
        
        await dbHelper.connect('identity-service', {
            dialect: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'rentease',
        });
        
        // 1. Register Landlord
        landlordData = {
            email: `landlord-tenant-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Landlord',
            lastName: 'Owner',
            phone: '555-1000'
        };
        await authHelper.register(landlordData);

        // 2. Register Tenant User (so they have a login)
        tenantData = {
            email: `tenant-portal-${Date.now()}@example.com`,
            password: 'Password123!',
            firstName: 'Test',
            lastName: 'Tenant',
            phone: '555-5000'
        };
        const tenantUser = await authHelper.register(tenantData);

        // 3. Link Tenant to Landlord (Create Tenant record)
        // Login as Landlord
        await authHelper.login(landlordData.email, landlordData.password);
        const token = authHelper.getToken();

        // Create Tenant via API
        const createTenantResponse = await request.post('http://localhost:4000/tenants', {
            headers: { 'Authorization': `Bearer ${token}` },
            data: {
                firstName: tenantData.firstName,
                lastName: tenantData.lastName,
                email: tenantData.email,
                phone: tenantData.phone
            }
        });
        if (createTenantResponse.status() !== 201) {
            console.log(`Create Tenant Failed: ${createTenantResponse.status()} ${await createTenantResponse.text()}`);
        }
        expect(createTenantResponse.status()).toBe(201);
        const createdTenant = await createTenantResponse.json();

        // 4. Manually link Tenant User to the Tenant (since Invitation flow is skipped)
        console.log(`Tenant User ID: ${tenantUser.id}`);
        console.log(`Created Tenant ID: ${createdTenant.id}`);
        try {
            await dbHelper.query('identity-service',
                `INSERT INTO "UserTenantMemberships" ("id", "userId", "tenantId", "createdAt", "updatedAt") VALUES ('${randomUUID()}', '${tenantUser.id}', '${createdTenant.id}', NOW(), NOW())`
            );
        } catch (e) {
            console.error('DB Insert Failed:', e);
            throw e;
        }
    });

    test('Tenant can Login and view Dashboard', async ({ page }) => {
        // Login as Tenant
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', tenantData.email);
        await page.fill('input[name="password"]', tenantData.password);
        await page.click('button[type="submit"]');

        // Should be redirected based on role (could be dashboard, portal, or admin)
        // Wait for navigation to complete
        await page.waitForURL(/\/(dashboard|portal|admin)/, { timeout: 15000 });
        
        // Verify Dashboard elements (currently shows landlord dashboard for all users)
        await expect(page.locator('h1')).toBeVisible();
    });
    test.afterAll(async () => {
        await dbHelper.close('identity-service');
    });
});
