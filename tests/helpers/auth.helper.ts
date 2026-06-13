import { request } from '@playwright/test';

function extractCookieValue(setCookieHeader: string | string[] | undefined, cookieName: string): string | undefined {
    if (!setCookieHeader) {
        return undefined;
    }

    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const cookie of cookies) {
        const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
        if (match?.[1]) {
            return match[1];
        }
    }

    return undefined;
}

export class AuthHelper {
    private baseUrl: string;
    private token?: string;
    private refreshToken?: string;
    private lastEmail?: string;
    private lastPassword?: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
    }): Promise<Record<string, unknown>> {
        const context = await request.newContext();
        const response = await context.post(`${this.baseUrl}/auth/register`, {
            data: userData,
        });

        if (!response.ok()) {
            throw new Error(`Registration failed: ${response.status()} ${await response.text()}`);
        }

        this.captureTokensFromResponse(response);
        return response.json();
    }

    async login(email: string, password: string): Promise<string> {
        this.lastEmail = email;
        this.lastPassword = password;
        const context = await request.newContext();
        const response = await context.post(`${this.baseUrl}/auth/login`, {
            data: { email, password },
        });

        if (!response.ok()) {
            throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
        }

        this.captureTokensFromResponse(response);

        if (!this.token) {
            throw new Error('Login succeeded but no access token cookie was returned');
        }

        return this.token;
    }

    getAuthHeaders(): Record<string, string> {
        if (!this.token) {
            throw new Error('Not authenticated. Call login() first.');
        }
        return { Authorization: `Bearer ${this.token}` };
    }

    getToken(): string {
        if (!this.token) {
            throw new Error('Not authenticated. Call login() first.');
        }
        return this.token;
    }

    async refreshAccessToken(): Promise<string> {
        const context = await request.newContext({
            extraHTTPHeaders: this.refreshToken
                ? { Cookie: `refreshToken=${this.refreshToken}` }
                : {},
        });
        const response = await context.post(`${this.baseUrl}/auth/refresh`);

        if (!response.ok()) {
            throw new Error(`Token refresh failed: ${response.status()}`);
        }

        this.captureTokensFromResponse(response);

        if (!this.token) {
            throw new Error('Refresh succeeded but no access token cookie was returned');
        }

        return this.token;
    }

    clearTokens(): void {
        this.token = undefined;
        this.refreshToken = undefined;
    }

    async createTenant(name: string): Promise<Record<string, unknown>> {
        if (!this.token) {
            throw new Error('Not authenticated. Call login() first.');
        }

        const context = await request.newContext();
        const response = await context.post(`${this.baseUrl}/tenants`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            data: { name },
        });

        if (!response.ok()) {
            throw new Error(`Create Tenant failed: ${response.status()} ${await response.text()}`);
        }

        const tenant = await response.json();

        if (this.lastEmail && this.lastPassword) {
            await this.login(this.lastEmail, this.lastPassword);
        }

        return tenant;
    }

    private captureTokensFromResponse(response: { headers: () => Record<string, string> }): void {
        const setCookie = response.headers()['set-cookie'];
        const accessToken = extractCookieValue(setCookie, 'accessToken');
        const refreshToken = extractCookieValue(setCookie, 'refreshToken');

        if (accessToken) {
            this.token = accessToken;
        }
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
    }
}
