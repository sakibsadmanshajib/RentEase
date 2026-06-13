const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function login(data: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to login');
    }

    return response.json();
}

export async function register(data: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register');
    }

    return response.json();
}

export interface AuthUser {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    orgId?: string;
    roles: string[];
}

/**
 * Check authentication status via HTTP-only cookie.
 * Returns user info if authenticated, null otherwise.
 */
export async function checkAuthStatus(): Promise<AuthUser | null> {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
        });
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
}

/**
 * Refresh the access token using the refresh token in HTTP-only cookie.
 * Returns true if refresh was successful.
 */
export async function refreshAuth(): Promise<{ success: boolean; orgId?: string }> {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            return { success: false };
        }
        const data = await response.json();
        return { success: data.authenticated !== false, orgId: data.orgId };
    } catch {
        return { success: false };
    }
}

/**
 * Logout - clears HTTP-only cookies on the server.
 */
export async function logout(): Promise<void> {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue anyway - cookies may still be cleared by browser
    }
}

/**
 * Switch to a different organization (for multi-org users).
 */
export async function switchOrg(orgId: string): Promise<{ success: boolean; orgId?: string }> {
    try {
        const response = await fetch(`${API_URL}/auth/switch-org`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgId }),
            credentials: 'include',
        });
        if (!response.ok) {
            return { success: false };
        }
        const data = await response.json();
        return { success: true, orgId: data.orgId };
    } catch {
        return { success: false };
    }
}
