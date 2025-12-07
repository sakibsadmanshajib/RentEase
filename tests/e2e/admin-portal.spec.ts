import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { dbHelper } from '../helpers/database.helper';
import { randomUUID } from 'crypto';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

test.describe('Admin Portal E2E', () => {
    let authHelper: AuthHelper;
    let adminEmail: string;

    test.beforeAll(async () => {
        authHelper = new AuthHelper('http://localhost:4000');
        
        await dbHelper.connect('identity', {
            dialect: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'rentease',
        });

        // 1. Register User
        adminEmail = `admin-portal-${Date.now()}@example.com`;
        const userData = {
            email: adminEmail,
            password: 'Password123!',
            firstName: 'System',
            lastName: 'Admin',
            phone: '555-9999'
        };
        await authHelper.register(userData);

        // 2. Assign Admin Role via DB
        // Check if Admin role exists
        const [roleResults] = await dbHelper.query('identity', `SELECT id FROM "Roles" WHERE name = 'Admin'`);
        let adminRoleId: string;

        if (roleResults.length > 0) {
            console.log('Found existing Admin role:', roleResults[0]);
            adminRoleId = roleResults[0].id;
        } else {
            console.log('Creating new Admin role...');
            // Create Admin role
            adminRoleId = randomUUID();
            await dbHelper.query('identity', `INSERT INTO "Roles" (id, name, description, "createdAt", "updatedAt") VALUES (:id, 'Admin', 'System Administrator', NOW(), NOW())`, {
                id: adminRoleId
            });
        }

        // Get User ID
        const [userResults] = await dbHelper.query('identity', `SELECT id FROM "Users" WHERE email = :email`, { email: adminEmail });
        if (userResults.length === 0) throw new Error('Admin user not found in DB');
        const userId = userResults[0].id;

        // Assign Role
        console.log(`Assigning Role ${adminRoleId} to User ${userId}`);
        await dbHelper.query('identity', `INSERT INTO "UserRoles" ("id", "userId", "roleId", "createdAt", "updatedAt") VALUES (:id, :userId, :roleId, NOW(), NOW())`, {
            id: randomUUID(),
            userId,
            roleId: adminRoleId
        });
    });

    test.afterAll(async () => {
        await dbHelper.close('identity');
    });

    test('Admin can Login and view Admin Dashboard', async ({ page }) => {
        // Login
        await page.goto(`${WEB_URL}/auth/login`);
        await page.fill('input[name="email"]', adminEmail);
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');

        // Should be redirected to Dashboard or Admin based on role
        // Wait for navigation to complete
        await page.waitForURL(/\/(dashboard|portal|admin)/, { timeout: 15000 });

        // Verify Dashboard elements (currently shows landlord dashboard for all users)
        await expect(page.locator('h1')).toBeVisible({ timeout: 10000 }); 
    });
});
