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
        console.log(`Registering user at ${this.baseUrl}/auth/register with data:`, JSON.stringify(userData));
        const response = await context.post(`${this.baseUrl}/auth/register`, {
            data: userData
        });

        if (!response.ok()) {
            console.log(`Registration response: ${response.status()} ${await response.text()}`);
            throw new Error(`Registration failed: ${response.status()} ${await response.text()}`);
        }

        return response.json();
    }

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<string> {
        this.lastEmail = email;
        this.lastPassword = password;
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
        return this.token!;
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
        return this.token!;
    }

    /**
     * Clear stored tokens
     */
    clearTokens(): void {
        this.token = undefined;
        this.refreshToken = undefined;
    }
    /**
     * Create a new tenant organization for the authenticated user
     * Note: After creating a tenant, you should call relogin() to get a new token with tenantId
     */
    async createTenant(name: string): Promise<any> {
        if (!this.token) {
            throw new Error('Not authenticated. Call login() first.');
        }

        const context = await request.newContext();
        console.log(`Creating tenant '${name}' at ${this.baseUrl}/tenants`);
        const response = await context.post(`${this.baseUrl}/tenants`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            data: { name }
        });

        if (!response.ok()) {
            throw new Error(`Create Tenant failed: ${response.status()} ${await response.text()}`);
        }

        const tenant = await response.json();
        
        // Re-login to get updated JWT with tenantId (membership was just created)
        if (this.lastEmail && this.lastPassword) {
            console.log(`Re-logging in as ${this.lastEmail} to get updated JWT with tenantId`);
            await this.login(this.lastEmail, this.lastPassword);
        }
        
        return tenant;
    }
    
    private lastEmail?: string;
    private lastPassword?: string;
}
