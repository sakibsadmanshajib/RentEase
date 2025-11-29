# RentEase – Production-Grade, Multi-Service Architecture Spec (v2)

## 0. Engineering Principles

These are non-negotiable:

*   **Domain-driven design (DDD) & multi-service**
    *   Services are organized by business domains, not by layers.
    *   Each service owns its data and exposes an API.
    *   No direct cross-DB joins between services.

*   **Security & privacy by design (US–Canada)**
    *   PII is minimized, encrypted, and access-controlled.
    *   Data access is logged and auditable.
    *   Tenancy isolation enforced at every layer.

*   **Finance is source of truth**
    *   Use double-entry ledger for all money movements.
    *   Immutable journal entries, no destructive edits. Corrections via reversing entries.
    *   Full audit trails for invoices, payments, refunds, and adjustments.

*   **Observability & reliability**
    *   Structured logs, metrics, traces with `tenant_id`, `correlation_id`.
    *   SLOs defined for core flows: login, invoice generation, payment posting, ticket creation.

*   **Extensibility & team-ready**
    *   Clean API contracts (OpenAPI/AsyncAPI).
    *   Testing pyramid: unit > integration > contract > e2e.
    *   Feature flags for rollouts.

## 1. High-Level Product Overview

RentEase is a B2B, multi-tenant rental property management SaaS for small–mid landlords in US/Canada.

**Core capabilities:**
*   Multi-tenant landlord accounts (organizations)
*   Properties, units, leases
*   Rent invoices, payments, double-entry accounting
*   Tenant portal (lease view, pay rent, tickets, messaging)
*   Ticketing/work orders with quotes and final expenses
*   Expense tracking (ticket-based + recurring)
*   Documents (leases, IDs, insurance)
*   Reporting: income, expenses, net profit, yearly tenant statements
*   Audit logs and data traceability

## 2. Service Decomposition

At MVP, we logically separate into services. They can be separate repos or a monorepo with clearly separated modules and databases.

### 2.1 API Gateway / BFF (Backend-for-Frontend)
*   Single entry point for web/SPA and future mobile.
*   **Handles:**
    *   Auth token validation (OIDC/JWT)
    *   Tenant context resolution
    *   Routing to domain services
    *   Response aggregation for dashboards
*   No business logic, just orchestration.

### 2.2 Identity & Access Service
*   **Responsibility:** Users, roles, permissions, tenant membership.
*   OIDC-based login (Google/Microsoft/etc.) + email/password as needed
*   Role-based access control (RBAC) with fine-grained permissions
*   Multi-tenant membership (user may belong to multiple organizations)
*   **Security features:**
    *   Password hashing (Argon2/bcrypt)
    *   MFA-ready
    *   Session invalidation, device management (later)

### 2.3 Tenant & Directory Service
*   **Responsibility:** Tenant organizations + staff/landlord directory.
*   Tenant (landlord org) creation and lifecycle
*   Invitations for staff/agents
*   Tenant-level configuration (time zone, currency, tax region, emergency defaults)

### 2.4 Property & Lease Service
*   **Responsibility:** Properties, units, leases, tenant people (occupants).
*   Property & unit CRUD
*   Lease lifecycle: Draft → Active → Terminated/Expired
*   **Lease details:**
    *   Monthly rent
    *   Advance rent (e.g., first/last month in Ontario)
    *   Security deposit
    *   Included services (parking, utilities, internet, appliances)
*   Tenant persons (occupants) linked to leases

### 2.5 Billing & Ledger Service
*   **Responsibility (critical):** Invoices, payments, double-entry ledger, income/expense recognition.
*   Generate rent schedules and invoices
*   Record payments against invoices
*   **Maintain ledger:**
    *   Accounts: Rent Receivable, Cash, Security Deposits, Expenses, etc.
    *   Each invoice/payment creates ledger entries
*   Provide financial reporting APIs.

### 2.6 Payments Integration Service
*   **Responsibility:** Payment providers (Stripe, ACH, etc.)
*   Tokenized payment methods (card/ACH) – PCI compliance: store only tokens
*   Create payment intents & handle webhooks
*   Map provider events → Billing & Ledger events
*   Idempotency & retry logic

### 2.7 Ticketing & Work Orders Service
*   **Responsibility:** Repairs/maintenance/general tickets.
*   Ticket creation, statuses, priorities
*   Comments/discussion per ticket
*   Quotes (estimates)
*   Link final expenses (via Expenses/Finance)
*   Compute time since opened, etc.
*   Inject property-specific emergency note.

### 2.8 Messaging Service (DMs)
*   **Responsibility:** Direct messages between users.
*   Message threads & participants
*   Messages (DMs) with typing indicators, read receipts (later)
*   Explicit separation from ticket comments (stored in Ticketing service).

### 2.9 Document Management Service
*   **Responsibility:** Documents and file storage.
*   Store document metadata (leases, IDs, insurance, inspection reports)
*   Use object storage (S3/R2) for files
*   Signed URLs for upload/download
*   Virus scanning integration hook

### 2.10 Expense & Reporting Service
*   **Responsibility:** Expenses, analytics, PDF outputs.
*   Expenses (ticket-linked + standalone, recurring)
*   **Aggregation of:**
    *   Income (from Ledger)
    *   Expenses (from Expenses)
    *   Net profit/loss
*   Yearly tenant statements for taxes
*   PDF generation and exports.

### 2.11 Audit & Compliance Service
*   **Responsibility:** Audit logs, access history, data actions.
*   **Immutable append-only log of:**
    *   Logins
    *   PII access/read/write
    *   Financial operations
    *   Settings changes
*   Query APIs for internal use and compliance.

## 3. Data Privacy & Security (US–Canada Oriented)

### 3.1 Data Classification
*   **PII:** Names, email, phone, address, ID docs
*   **Financial data:** Invoices, payments, ledger, bank references
*   **Sensitive docs:** IDs, leases, background checks

### 3.2 Storage Practices
*   **At rest:**
    *   DB encryption (volume-level)
    *   Field-level encryption for: `tenant_person.email`, `tenant_person.phone`, landlord contact info
*   **In transit:** TLS 1.2+ everywhere.

### 3.3 Multi-Tenancy Isolation
*   Every table includes `tenant_id`.
*   RLS (Row-Level Security) or schema-per-tenant.
*   Service-layer checks always enforce tenant scope.
*   No cross-tenant queries.

### 3.4 Access Control
*   RBAC per user → roles → permissions
*   Permissions like: `lease.read`, `lease.write`, `invoice.read`, `invoice.write`, `finance.report.read`

### 3.5 Retention & Deletion
*   Soft delete for operational entities; hard delete only after retention period.
*   Tenant-level data export & purge (data portability & “right to be forgotten” support).
*   Records must be logically linked for clean deletions (or anonymization) later.

## 4. Domain Models (Per Service)

### 4.1 Tenant & Directory
*   **Tenant:** `id`, `name`, `contact_email`, `contact_phone`, Address fields, `region`, `created_at`, `updated_at`
*   **UserTenantMembership:** `user_id`, `tenant_id`, `role_id`
*   **Role / Permission:** `role_id`, `name`, Permission mapping table.

### 4.2 Property & Lease
*   **Property:** `id`, `tenant_id`, `name`, `address` fields, `emergency_phone`, `notes`
*   **Unit:** `id`, `tenant_id`, `property_id`, `unit_number`, `bedrooms`, `bathrooms`, `floor`, `square_feet`, `status`
*   **Person (Occupant):** `id`, `tenant_id`, `first_name`, `last_name`, `email`, `phone`, `role`
*   **Lease:**
    *   `id`, `tenant_id`, `property_id`, `unit_id`, `primary_tenant_id`
    *   `start_date`, `end_date`, `monthly_rent`, `currency`
    *   Ontario-specific: `advance_rent_amount`, `security_deposit_amount`
    *   Services: `includes_parking`, `parking_spot_id`, `parking_extra_charge`, `includes_water`, `includes_gas`, `includes_heating`, `includes_electricity`, `includes_internet`, `home_appliances_included` (JSON)
    *   `status` (draft/active/terminated/expired)

### 4.3 Billing & Ledger
*   **Invoice:** `id`, `tenant_id`, `lease_id`, `property_id`, `unit_id`, `invoice_number`, `issue_date`, `due_date`, `period_start`, `period_end`, `amount_due`, `currency`, `status`
*   **Payment:** `id`, `tenant_id`, `invoice_id`, `lease_id`, `property_id`, `unit_id`, `payer_name`, `method`, `amount`, `payment_date`, `status`, `provider_reference`, `metadata`
*   **LedgerAccount:** `id`, `tenant_id`, `code`, `name`, `type`
*   **LedgerEntry:** `id`, `tenant_id`, `journal_id`, `account_id`, `debit`, `credit`, `currency`, `correlation_id`, `created_at`
    *   Constraint: SUM(debit) == SUM(credit) per journal_id.

### 4.4 Ticketing
*   **Ticket:** `id`, `tenant_id`, `property_id`, `unit_id`, `lease_id`, `title`, `description`, `category`, `priority`, `status`, `opened_at`, `closed_at`, `created_by_user_id`, `assigned_to_user_id`
*   **TicketComment:** `ticket_id`, `author_user_id`, `body`, `is_internal`, `created_at`
*   **TicketQuote:** `ticket_id`, `description`, `estimated_amount`, `vendor_name`, `created_at`

### 4.5 Expenses
*   **Expense:** `id`, `tenant_id`, `property_id`, `unit_id`, `ticket_id`, `category`, `description`, `amount`, `currency`, `date_incurred`, `is_recurring`, `recurrence_type`, `recurrence_end_date`, `created_at`, `updated_at`

### 4.6 Documents
*   **Document:** `id`, `tenant_id`, `property_id`, `unit_id`, `lease_id`, `document_type`, `file_name`, `mime_type`, `storage_url`, `uploaded_by_user_id`, `uploaded_at`

### 4.7 Messaging (DMs Only)
*   **MessageThread:** `id`, `tenant_id`, `subject`, `created_at`, `updated_at`
*   **MessageParticipant:** `thread_id`, `user_id`
*   **DirectMessage:** `id`, `thread_id`, `sender_user_id`, `body`, `created_at`

### 4.8 Audit Logs
*   **AuditEvent:** `id`, `tenant_id`, `actor_user_id`, `event_type`, `entity_type`, `entity_id`, `metadata` (JSON), `created_at`

## 5. Reporting Requirements

### 5.1 Income & Expense Reports
*   **Income:** based on Payments with status = completed.
*   **Expense:** based on Expense entries.
*   **Filters:** date range, property, unit, tenant.
*   **Output:** Totals, Net profit/loss, Breakdown.

### 5.2 Yearly Tenant Rent Statement (Tax)
*   Per tenant person + year.
*   Details: Tenant info, Landlord info, Monthly breakdown, Total annual rent.
*   Endpoint: `GET /reports/tenant-yearly-rent?tenantPersonId=&year=`

### 5.3 Landlord P&L Dashboard
*   Period summary (YTD or last 12 months).
*   Returns: Income total, Expense total, Net profit/loss.

## 6. Dummy/Seed Data Requirements
*   Tenants (landlord orgs): 3
*   Properties: 10
*   Units: 25
*   Persons: 30
*   Leases: 20
*   Invoices: 200+
*   Payments: 200+
*   Tickets: 25–30
*   TicketComments: 150–200
*   TicketQuotes: 40
*   Expenses: 150–200
*   Documents: 50
*   DM Threads: 30
*   DirectMessages: 100+

## 7. Frontend Behaviour
*   Call the right services.
*   Show income & expenses on Reports page.
*   Show expenses list properly.
*   Show documents list properly.
*   Ensure Messages page shows only DMs.
*   **No gimmick “seed/test” pages/buttons.**

## 8. Coding & Operational Practices
*   **Tech Stack:** TypeScript + NestJS, Next.js/React, PostgreSQL, Redis/Kafka, S3/R2.
*   **Code Quality:** Linting, Unit/Integration/Contract tests, CI/CD.
*   **API Versioning:** `/api/v1/...`
*   **SLOs:** p95 latency < 300ms (read), < 700ms (write). Availability 99.5%.
