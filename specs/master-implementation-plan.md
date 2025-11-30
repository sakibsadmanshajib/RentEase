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
- [x] Implement RBAC (Roles, Permissions) fully.
    - *Details*: Implemented `RolesGuard` with `nestjs-cls` for tenant context. Supports global and tenant-specific roles.
- [x] Implement `UserTenantMembership` for multi-tenancy.
    - *Details*: Created `UsersService` and `UsersController` to manage memberships. Added `POST /users/:userId/tenants` and `GET /users/me`.
- [x] Secure PII storage.
    - *Status*: `phone`, `firstName`, and `lastName` are encrypted via `EncryptionService`. `email` is plain text for uniqueness checks.

### 2.2 Tenant & Directory Service
- [x] Implement Organization lifecycle (Create/Suspend).
    - *Details*: Added `suspend`/`activate` endpoints in `TenantController`.
- [x] Implement Staff Invitations flow.
    - *Details*: Updated `acceptInvitation` to call Identity Service via `HttpModule` to create membership. Protected endpoint with `JwtAuthGuard`.

### 2.3 Property & Lease Service
- [x] Implement Unit management.
    - *Details*: Implemented `Unit` model with status (VACANT/OCCUPIED). Added CRUD endpoints in `UnitController`.
- [x] Implement full Lease lifecycle (Draft -> Active -> Expired).
    - *Details*: Implemented `Lease` model with statuses (DRAFT, ACTIVE, TERMINATED). Added `activate` and `terminate` endpoints that automatically update Unit status.
- [x] Add Occupant tracking.
    - *Details*: Implemented `LeaseOccupant` model linking Leases to Users. Added `POST /leases/:id/occupants` endpoint.

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
