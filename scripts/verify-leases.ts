import axios from 'axios';

const API_URL = 'http://localhost:4000/leases';

async function verifyLeases() {
    console.log('Testing Create Lease...');
    try {
        const leaseData = {
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            rentAmount: 1500,
            propertyId: 'prop-123', // Mock ID
            tenantId: 'tenant-123', // Mock ID
        };

        const createResponse = await axios.post(API_URL, leaseData);
        console.log('Create Lease successful:', createResponse.data);

        const leaseId = createResponse.data.id;

        console.log('Testing Get All Leases...');
        const getAllResponse = await axios.get(API_URL);
        console.log('Get All Leases successful. Count:', getAllResponse.data.length);

        console.log('Testing Get Lease by ID...');
        const getOneResponse = await axios.get(`${API_URL}/${leaseId}`);
        console.log('Get Lease by ID successful:', getOneResponse.data.id);

        console.log('Lease verification passed!');
    } catch (error: any) {
        console.error('Lease verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

verifyLeases();
