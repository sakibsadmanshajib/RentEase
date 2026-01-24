import { refreshAuth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type RequestOptions = RequestInit & {
    headers?: Record<string, string>;
};

async function fetchWithAuth(endpoint: string, options: RequestOptions = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // We don't attach token header anymore - cookies are sent automatically with credentials: 'include'
    
    let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        cache: 'no-store',
        headers,
        credentials: 'include', // Send cookies with requests
    });

    if (response.status === 401) {
        // Token might be expired, try to refresh
        const { success } = await refreshAuth();
        if (success) {
            // Retry the original request
            response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                cache: 'no-store',
                headers,
                credentials: 'include',
            });
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API request failed: ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

export const api = {
    get: (endpoint: string) => fetchWithAuth(endpoint),
    post: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    patch: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    delete: (endpoint: string) => fetchWithAuth(endpoint, {
        method: 'DELETE',
    }),
};
