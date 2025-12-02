import { APIRequestContext, request } from '@playwright/test';

export class ApiHelper {
    /**
     * Create an authenticated request context
     */
    static async createAuthenticatedContext(token: string): Promise<APIRequestContext> {
        return request.newContext({
            extraHTTPHeaders: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Make an authenticated GET request
     */
    static async get(
        url: string,
        token: string,
        options?: { params?: Record<string, string> }
    ) {
        const context = await this.createAuthenticatedContext(token);
        const queryString = options?.params
            ? '?' + new URLSearchParams(options.params).toString()
            : '';

        const response = await context.get(url + queryString);
        return response;
    }

    /**
     * Make an authenticated POST request
     */
    static async post(
        url: string,
        token: string,
        data: any
    ) {
        const context = await this.createAuthenticatedContext(token);
        const response = await context.post(url, { data });
        return response;
    }

    /**
     * Make an authenticated PATCH request
     */
    static async patch(
        url: string,
        token: string,
        data: any
    ) {
        const context = await this.createAuthenticatedContext(token);
        const response = await context.patch(url, { data });
        return response;
    }

    /**
     * Make an authenticated DELETE request
     */
    static async delete(
        url: string,
        token: string
    ) {
        const context = await this.createAuthenticatedContext(token);
        const response = await context.delete(url);
        return response;
    }

    /**
     * Parse JSON response with error handling
     */
    static async parseJson(response: any): Promise<any> {
        try {
            return await response.json();
        } catch (error) {
            const text = await response.text();
            throw new Error(`Failed to parse JSON response: ${text}`);
        }
    }

    /**
     * Generate unique test identifier
     */
    static generateTestId(prefix: string = 'test'): string {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
