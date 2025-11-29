const API_URL = 'http://localhost:4000';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // In a real app, we would attach the token here
    // const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        // 'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

export const api = {
    get: (endpoint: string) => fetchWithAuth(endpoint),
    post: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};
