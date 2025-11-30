import { request, APIRequestContext } from '@playwright/test';

export class AuthHelper {
    private baseUrl: string;
    private token?: string;
    private refreshToken?: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Register a new user
     */
    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
    }): Promise<any> {
        const context = await request.newContext();
        const response = await context.post(`${this.baseUrl}/auth/register`, {
            data: userData
        });

        if (!response.ok()) {
            throw new Error(`Registration failed: ${response.status()} ${await response.text()}`);
        }

        return response.json();
    }

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<string> {
        const context = await request.newContext();
        const response = await context.post(`${this.baseUrl}/auth/login`, {
            data: { email, password }
        });

        if (!response.ok()) {
            throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
        }

        const body = await response.json();
        this.token = body.accessToken;
        this.refreshToken = body.refreshToken;
        return this.token;
    }

    /**
     * Get authorization headers for authenticated requests
     */
    getAuthHeaders(): Record<string, string> {
        if (!this.token) {
            throw new Error('Not authenticated. Call login() first.');
        }
        return { 'Authorization': `Bearer ${this.token}` };
    }

    /**
     * Get the current access token
     */
    getToken(): string {
        if (!this.token) {
            throw new Error('Not authenticated. Call login() first.');
        }
        return this.token;
    }

    /**
     * Refresh the access token
     */
    async refreshAccessToken(): Promise<string> {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        const context = await request.newContext();
        const response = await context.post(`${this.baseUrl}/auth/refresh`, {
            data: { refreshToken: this.refreshToken }
        });

        if (!response.ok()) {
            throw new Error(`Token refresh failed: ${response.status()}`);
        }

        const body = await response.json();
        this.token = body.accessToken;
        return this.token;
    }

    /**
     * Clear stored tokens
     */
    clearTokens(): void {
        this.token = undefined;
        this.refreshToken = undefined;
    }
}
