# Master Technical Implementation Plan

## Phase 1: Foundation (Completed)
- [x] **Monorepo Setup**: Turborepo, pnpm, shared configs.
- [x] **Service Scaffolding**: NestJS apps for Identity, Tenant, Property, Billing.
- [x] **Frontend Setup**: Next.js, Tailwind, UI Components.
- [x] **Initial MVP Features**:
    - Identity: Basic Auth (Login/Register).
    - Property: Basic CRUD.
    - Tenant Portal: Basic Lease View.
    - Landlord Portal: Basic Property List.

## Phase 2: Core Domain Implementation (Next Steps)
**Goal**: Fully functional backend services with domain logic and databases.

### 2.1 Identity & Access Service
- [ ] Implement RBAC (Roles, Permissions) fully.
- [ ] Implement `UserTenantMembership` for multi-tenancy.
- [ ] Secure PII storage.

### 2.2 Tenant & Directory Service
- [ ] Implement Organization lifecycle (Create/Suspend).
- [ ] Implement Staff Invitations flow.

### 2.3 Property & Lease Service
- [ ] Implement Unit management.
- [ ] Implement full Lease lifecycle (Draft -> Active -> Expired).
- [ ] Add Occupant tracking.

### 2.4 Billing & Ledger Service
- [ ] Implement Double-Entry Ledger core.
- [ ] Implement Recurring Invoice Scheduler.
- [ ] Implement Payment Recording.

## Phase 3: Operations & Integrations
**Goal**: Add "Day 2" operational features.

### 3.1 Ticketing Service
- [ ] Implement Ticket CRUD with priorities.
- [ ] Implement Commenting system.

### 3.2 Payments Integration
- [ ] Integrate Stripe (Tokenization & Webhooks).
- [ ] Connect Payments to Billing Ledger.

### 3.3 Messaging & Documents
- [ ] Implement DM Service (Threads/Messages).
- [ ] Implement Document Service (S3 Uploads/Signed URLs).

## Phase 4: Reporting & Compliance
**Goal**: Financial insights and security.

### 4.1 Expense & Reporting
- [ ] Implement Expense tracking.
- [ ] Build P&L Report generator.
- [ ] Build Tenant Tax Statement generator.

### 4.2 Audit & Compliance
- [ ] Implement Audit Logging interceptors across all services.
- [ ] Build Audit Log viewer for Admins.

## Phase 5: Frontend Polish & Launch
**Goal**: Production-ready UI.

- [ ] **Tenant Portal**: Complete Payments and Maintenance flows.
- [ ] **Landlord Portal**: Complete Financials and CRM flows.
- [ ] **Admin Portal**: Build User/Tenant management.
- [ ] **E2E Testing**: Cypress/Playwright tests for critical flows.
