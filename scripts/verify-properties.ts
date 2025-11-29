import axios from 'axios';

const API_URL = 'http://localhost:4000/properties';

async function verifyProperties() {
    console.log('Testing Create Property...');
    try {
        const propertyData = {
            name: 'Test Property',
            address: '123 Test St',
            tenantId: 'none',
        };

        const createResponse = await axios.post(API_URL, propertyData);
        console.log('Create Property successful:', createResponse.data);

        const propertyId = createResponse.data.id;

        console.log('Testing Get All Properties...');
        const getAllResponse = await axios.get(API_URL);
        console.log('Get All Properties successful. Count:', getAllResponse.data.length);

        console.log('Testing Get Property by ID...');
        const getOneResponse = await axios.get(`${API_URL}/${propertyId}`);
        console.log('Get Property by ID successful:', getOneResponse.data.id);

        console.log('Property verification passed!');
    } catch (error: any) {
        console.error('Property verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

verifyProperties();
