import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../helpers/api.helper';
import { randomUUID } from 'crypto';

const BASE_URL = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3003';

test.describe('Property Service - Leases @api', () => {
    const testPropertyId = randomUUID();
    const testTenantId = `tenant-${ApiHelper.generateTestId()}`;
    let createdLeaseId: string;

    // Create a property first for lease tests
    test.beforeAll(async ({ request }) => {
        // Create a property to use with leases
        await request.post(`${BASE_URL}/properties`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                name: `Lease Test Property ${Date.now()}`,
                address: '123 Lease Test St',
                tenantId: testTenantId
            }
        });
    });

    test('should create a lease with valid data', async ({ request }) => {
        // First create a property
        const propResponse = await request.post(`${BASE_URL}/properties`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                name: `Lease Property ${Date.now()}`,
                address: '456 Lease St',
                tenantId: testTenantId
            }
        });
        const property = await propResponse.json();

        const leaseData = {
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            rentAmount: 1500,
            propertyId: property.id,
            tenantId: testTenantId
        };

        const response = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: leaseData
        });

        expect(response.status()).toBe(201);
        const lease = await response.json();
        expect(lease).toHaveProperty('id');
        expect(parseFloat(lease.rentAmount)).toBe(leaseData.rentAmount);
        expect(lease.propertyId).toBe(property.id);
        expect(lease.tenantId).toBe(testTenantId);
        
        createdLeaseId = lease.id;
    });

    test('should reject lease without startDate (required field)', async ({ request }) => {
        const leaseData = {
            // Missing startDate
            endDate: '2025-12-31',
            rentAmount: 1500,
            propertyId: randomUUID(),
            tenantId: testTenantId
        };

        const response = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: leaseData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject lease without endDate (required field)', async ({ request }) => {
        const leaseData = {
            startDate: '2025-01-01',
            // Missing endDate
            rentAmount: 1500,
            propertyId: randomUUID(),
            tenantId: testTenantId
        };

        const response = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: leaseData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject lease without rentAmount (required field)', async ({ request }) => {
        const leaseData = {
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            // Missing rentAmount
            propertyId: randomUUID(),
            tenantId: testTenantId
        };

        const response = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: leaseData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject lease without propertyId (required field)', async ({ request }) => {
        const leaseData = {
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            rentAmount: 1500,
            // Missing propertyId
            tenantId: testTenantId
        };

        const response = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: leaseData
        });

        expect(response.status()).toBe(400);
    });

    test('should reject lease without tenantId (required field)', async ({ request }) => {
        const leaseData = {
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            rentAmount: 1500,
            propertyId: randomUUID()
            // Missing tenantId
        };

        const response = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: leaseData
        });

        expect(response.status()).toBe(400);
    });

    test('should list all leases', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/leases`);
        
        expect(response.status()).toBe(200);
        const leases = await response.json();
        expect(Array.isArray(leases)).toBe(true);
    });

    test('should get lease by ID', async ({ request }) => {
        // First create a property and lease
        const propResponse = await request.post(`${BASE_URL}/properties`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                name: `GetById Lease Property ${Date.now()}`,
                address: '789 GetById St',
                tenantId: testTenantId
            }
        });
        const property = await propResponse.json();

        const createResponse = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                startDate: '2025-01-01',
                endDate: '2025-12-31',
                rentAmount: 2000,
                propertyId: property.id,
                tenantId: testTenantId
            }
        });
        const createdLease = await createResponse.json();

        // Get by ID
        const response = await request.get(`${BASE_URL}/leases/${createdLease.id}`);
        
        expect(response.status()).toBe(200);
        const lease = await response.json();
        expect(lease.id).toBe(createdLease.id);
        expect(parseFloat(lease.rentAmount)).toBe(2000);
    });

    test('should update lease', async ({ request }) => {
        // First create a property and lease
        const propResponse = await request.post(`${BASE_URL}/properties`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                name: `Update Lease Property ${Date.now()}`,
                address: '111 Update St',
                tenantId: testTenantId
            }
        });
        const property = await propResponse.json();

        const createResponse = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                startDate: '2025-01-01',
                endDate: '2025-12-31',
                rentAmount: 2500,
                propertyId: property.id,
                tenantId: testTenantId
            }
        });
        const createdLease = await createResponse.json();

        // Update it
        const updateData = {
            rentAmount: 3000
        };
        const response = await request.patch(`${BASE_URL}/leases/${createdLease.id}`, {
            headers: { 'Content-Type': 'application/json' },
            data: updateData
        });
        
        expect(response.status()).toBe(200);
        const updatedLease = await response.json();
        expect(updatedLease.rentAmount).toBe(3000);
    });

    test('should delete lease', async ({ request }) => {
        // First create a property and lease
        const propResponse = await request.post(`${BASE_URL}/properties`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                name: `Delete Lease Property ${Date.now()}`,
                address: '222 Delete St',
                tenantId: testTenantId
            }
        });
        const property = await propResponse.json();

        const createResponse = await request.post(`${BASE_URL}/leases`, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                startDate: '2025-01-01',
                endDate: '2025-12-31',
                rentAmount: 1800,
                propertyId: property.id,
                tenantId: testTenantId
            }
        });
        const createdLease = await createResponse.json();

        // Delete it
        const deleteResponse = await request.delete(`${BASE_URL}/leases/${createdLease.id}`);
        expect(deleteResponse.status()).toBe(200);

        // Verify it's gone
        const getResponse = await request.get(`${BASE_URL}/leases/${createdLease.id}`);
        expect(getResponse.status()).toBe(404);
    });

    test('should return 404 for non-existent lease', async ({ request }) => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request.get(`${BASE_URL}/leases/${fakeId}`);
        
        expect(response.status()).toBe(404);
    });
});
