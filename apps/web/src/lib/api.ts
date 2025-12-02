const API_URL = 'http://localhost:4000';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // In a real app, we would attach the token here
    const token = localStorage.getItem('token');
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        cache: 'no-store',
        next: { revalidate: 0 },
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

export const api = {
    get: (endpoint: string) => fetchWithAuth(endpoint),
    post: async (endpoint: string, data: any) => {
        return fetchWithAuth(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    patch: async (endpoint: string, data: any) => {
        return fetchWithAuth(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    },

    delete: async (endpoint: string) => {
        return fetchWithAuth(endpoint, {
            method: 'DELETE',
        })
    },
};
