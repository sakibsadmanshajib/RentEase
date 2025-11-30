import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',

    // Test organization
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 4 : undefined,

    // Reporting
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['list']
    ],

    // Global timeout
    timeout: 30000,
    expect: {
        timeout: 5000
    },

    // Base URL for API tests
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    // Projects for different test types
    projects: [
        // API Tests
        {
            name: 'api-identity',
            testDir: './tests/api/identity',
            use: { baseURL: 'http://localhost:3001' },
        },
        {
            name: 'api-tenant',
            testDir: './tests/api/tenant',
            use: { baseURL: 'http://localhost:3002' },
        },
        {
            name: 'api-property',
            testDir: './tests/api/property',
            use: { baseURL: 'http://localhost:3003' },
        },
        {
            name: 'api-billing',
            testDir: './tests/api/billing',
            use: { baseURL: 'http://localhost:3004' },
        },

        // Integration Tests
        {
            name: 'integration',
            testDir: './tests/integration',
        },

        // E2E Browser Tests
        {
            name: 'chromium-e2e',
            testDir: './tests/e2e',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:3000'
            },
        },
        {
            name: 'firefox-e2e',
            testDir: './tests/e2e',
            use: {
                ...devices['Desktop Firefox'],
                baseURL: 'http://localhost:3000'
            },
        },
    ],

    // Web server for E2E tests (disabled in CI, services managed externally)
    webServer: process.env.CI ? undefined : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
