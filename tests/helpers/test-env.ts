export const IDENTITY_SERVICE_URL =
    process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

export const ORGANIZATION_SERVICE_URL =
    process.env.ORGANIZATION_SERVICE_URL ||
    process.env.TENANT_SERVICE_URL ||
    'http://localhost:3005';

export const PROPERTY_SERVICE_URL =
    process.env.PROPERTY_SERVICE_URL || 'http://localhost:3003';

export const BILLING_SERVICE_URL =
    process.env.BILLING_SERVICE_URL || 'http://localhost:3004';

export const API_GATEWAY_URL =
    process.env.API_GATEWAY_URL || 'http://localhost:4000';

export const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
