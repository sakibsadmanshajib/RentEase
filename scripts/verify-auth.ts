import axios from 'axios';

const API_URL = 'http://localhost:4000/auth';

async function verifyAuth() {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Testing registration for ${email}...`);
    try {
        const registerResponse = await axios.post(`${API_URL}/register`, {
            email,
            password,
        });
        console.log('Registration successful:', registerResponse.data);
    } catch (error: any) {
        console.error('Registration failed:', error.response?.data || error.message);
        process.exit(1);
    }

    console.log('Testing login...');
    try {
        const loginResponse = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        console.log('Login successful:', loginResponse.data);
        if (!loginResponse.data.access_token) {
            console.error('No access token returned');
            process.exit(1);
        }
    } catch (error: any) {
        console.error('Login failed:', error.response?.data || error.message);
        process.exit(1);
    }

    console.log('Auth verification passed!');
}

verifyAuth();
