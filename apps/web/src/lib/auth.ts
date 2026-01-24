const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function login(data: any) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to login');
    }

    return response.json();
}

export async function register(data: any) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register');
    }

    return response.json();
}

export async function getProfile(token: string) {
    const response = await fetch(`${API_URL}/users/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }

    return response.json();
}

/**
 * Logout - calls backend to acknowledge logout before client-side cleanup.
 * Note: Current implementation is stateless; token remains valid until expiry.
 */
export async function logout(token: string): Promise<void> {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with client-side cleanup even if API call fails
    }
}
