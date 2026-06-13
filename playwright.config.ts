import { defineConfig, devices } from '@playwright/test';

const isCi = !!process.env.CI;

export default defineConfig({
    testDir: './tests',

    // Test organization
    fullyParallel: true,
    forbidOnly: isCi,
    retries: isCi ? 2 : 0,
    workers: isCi ? 4 : undefined,

    // Fail fast in CI instead of running until the 6h GitHub job limit
    globalTimeout: isCi ? 8 * 60 * 1000 : undefined,

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

    // API request timeout (prevents hung connections when services are down)
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: isCi ? 10_000 : undefined,
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
            use: { baseURL: 'http://localhost:3005' },
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
        {
            name: 'api-gateway',
            testDir: './tests/api/gateway',
            use: { baseURL: 'http://localhost:4000' },
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
            },
        },
        // {
        //     name: 'firefox-e2e',
        //     testDir: './tests/e2e',
        //     use: {
        //         ...devices['Desktop Firefox'],
        //     },
        // },
        // {
        //   name: 'webkit-e2e',
        //   use: { ...devices['Desktop Safari'] },
        //   testDir: './tests/e2e',
        // },
    ],

    // Web server for E2E tests only (disabled for API tests and CI)
    // webServer: (process.env.CI || process.env.API_ONLY) ? undefined : {
    //     command: 'pnpm dev',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120000,
    // },
});
