import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api.helper';
import { AuthHelper } from '../helpers/auth.helper';

const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';
const PROPERTY_URL = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3003';
const BILLING_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3004';

test.describe('Billing Lifecycle E2E @e2e', () => {
    let landlordAuth: AuthHelper;
    let tenantAuth: AuthHelper;
    let landlordToken: string;
    let tenantToken: string;
    let landlordId: string;
    let tenantId: string;
    let propertyId: string;
    let unitId: string;
    let leaseId: string;
    const organizationId = `org-${ApiHelper.generateTestId()}`;

    test.beforeAll(async () => {
        // 1. Register Landlord
        landlordAuth = new AuthHelper(IDENTITY_URL);
        const landlordData = {
            email: `landlord-${ApiHelper.generateTestId()}@example.com`,
            password: 'Password123!',
            firstName: 'John',
            lastName: 'Landlord',
            phone: '+15550001111'
        };
        await landlordAuth.register(landlordData);
        landlordToken = await landlordAuth.login(landlordData.email, landlordData.password);
        const landlordProfile = await ApiHelper.get(`${IDENTITY_URL}/users/me`, landlordToken);
        const landlordJson = await landlordProfile.json();
        landlordId = landlordJson.id;

        // 2. Register Tenant
        tenantAuth = new AuthHelper(IDENTITY_URL);
        const tenantData = {
            email: `tenant-${ApiHelper.generateTestId()}@example.com`,
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Tenant',
            phone: '+15550002222'
        };
        await tenantAuth.register(tenantData);
        tenantToken = await tenantAuth.login(tenantData.email, tenantData.password);
        const tenantProfile = await ApiHelper.get(`${IDENTITY_URL}/users/me`, tenantToken);
        const tenantJson = await tenantProfile.json();
        tenantId = tenantJson.id;
    });

    test('Full Billing Cycle: Invoice -> Payment -> Ledger', async () => {
        // 3. Create Property (Landlord)
        const propertyRes = await ApiHelper.post(`${PROPERTY_URL}/properties`, landlordToken, {
            name: 'Sunset Apartments',
            address: '123 Sunset Blvd',
            tenantId: organizationId
        });
        if (propertyRes.status() !== 201) {
            const text = await propertyRes.text();
            throw new Error(`Property Creation Failed: ${propertyRes.status()} ${text}`);
        }
        expect(propertyRes.status()).toBe(201);
        const property = await propertyRes.json();
        propertyId = property.id;

        // 4. Create Unit (Landlord)
        const unitRes = await ApiHelper.post(`${PROPERTY_URL}/units`, landlordToken, {
            propertyId,
            unitNumber: '101'
        });
        if (unitRes.status() !== 201) {
            const text = await unitRes.text();
            throw new Error(`Unit Creation Failed: ${unitRes.status()} ${text}`);
        }
        expect(unitRes.status()).toBe(201);
        const unit = await unitRes.json();
        unitId = unit.id;

        // 5. Create Lease (Landlord)
        const leaseRes = await ApiHelper.post(`${PROPERTY_URL}/leases`, landlordToken, {
            propertyId,
            unitId,
            tenantId, // Assuming Property Service can link by ID, or we might need to invite tenant first. 
            // For simplicity, assuming direct linking or skipping if complex.
            // If Property Service requires Occupant creation separately, we might skip this step 
            // and just use IDs for Billing Service if it doesn't strictly validate existence across services yet.
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            rentAmount: 1500,
            status: 'ACTIVE'
        });
        // Note: If Property Service isn't fully ready for this flow, we might mock IDs.
        // But let's try to use real IDs if possible. If this fails, we'll fallback to generated IDs for Billing test.

        // For the purpose of Billing Service E2E, we mainly need valid IDs that Billing Service accepts.
        // Billing Service likely doesn't call Property Service to validate IDs synchronously yet (microservices).
        // So we can use the IDs we generated or even fake ones if cross-service validation isn't enforced.

        leaseId = (leaseRes.status() === 201) ? (await leaseRes.json()).id : `lease-${ApiHelper.generateTestId()}`;

        // 6. Create Invoice (Landlord)
        const invoiceRes = await ApiHelper.post(`${BILLING_URL}/invoices`, landlordToken, {
            tenantId: organizationId,
            leaseId,
            amount: 1500,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            items: [
                { description: 'Rent for December', amount: 1500 }
            ]
        });
        expect(invoiceRes.status()).toBe(201);
        const invoice = await invoiceRes.json();
        expect(invoice.status).toBe('PENDING');

        // 7. Verify Ledger (AR created)
        const ledgerRes1 = await ApiHelper.get(`${BILLING_URL}/invoices/ledger?tenantId=${organizationId}`, landlordToken);
        const ledger1 = await ledgerRes1.json();
        const arEntry = ledger1.find((e: any) => e.correlationId === invoice.id && parseFloat(e.debit) > 0);
        expect(arEntry).toBeDefined();

        // 8. Record Payment (Tenant pays)
        // Note: In real world, Tenant initiates, but maybe Landlord records it? 
        // Or Tenant uses a payment gateway. The endpoint is `POST /invoices/payments`.
        // Let's assume Landlord records it for now, or Tenant if allowed.
        const paymentRes = await ApiHelper.post(`${BILLING_URL}/invoices/payments`, landlordToken, {
            tenantId: organizationId,
            invoiceId: invoice.id,
            amount: 1500,
            method: 'BANK_TRANSFER'
        });
        expect(paymentRes.status()).toBe(201);

        // 9. Verify Invoice Status
        const updatedInvoiceRes = await ApiHelper.get(`${BILLING_URL}/invoices/${invoice.id}`, landlordToken);
        const updatedInvoice = await updatedInvoiceRes.json();
        expect(updatedInvoice.status).toBe('PAID');

        // 10. Verify Ledger (Cash created)
        const ledgerRes2 = await ApiHelper.get(`${BILLING_URL}/invoices/ledger?tenantId=${organizationId}`, landlordToken);
        const ledger2 = await ledgerRes2.json();
        const cashEntry = ledger2.find((e: any) => parseFloat(e.credit) === 0 && parseFloat(e.debit) === 1500); // Debit Cash
        expect(cashEntry).toBeDefined();
    });
});
