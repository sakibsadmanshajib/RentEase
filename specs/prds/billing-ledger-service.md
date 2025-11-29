# PRD: Billing & Ledger Service

## 1. Overview
The Billing & Ledger Service is the financial heart of RentEase. It handles invoicing, payment processing, and maintains a rigorous double-entry ledger for all financial transactions. It ensures that "Finance is the source of truth."

## 2. User Stories

### Invoicing
- **As a System**, I want to automatically generate monthly rent invoices for all active leases.
- **As a Landlord**, I want to create one-off invoices for things like repairs or late fees.
- **As a Tenant**, I want to view my upcoming and past invoices.

### Payments
- **As a Tenant**, I want to pay my invoice online (Credit Card, ACH).
- **As a Landlord**, I want to manually record a payment (Cash, Check) received offline.
- **As a System**, I want to automatically reconcile payments against invoices.

### Accounting (Ledger)
- **As a Landlord**, I want to see a clear ledger of all income and expenses.
- **As an Accountant**, I want to see double-entry records (Debits/Credits) to verify financial integrity.
- **As a System**, I want to ensure that every financial action creates an immutable ledger entry.

## 3. Functional Requirements

### 3.1 Invoicing
- Recurring invoice generation (Cron job / Scheduler).
- Proration logic for partial months.
- Invoice statuses: Draft, Open, Paid, Partially Paid, Overdue, Void.

### 3.2 Double-Entry Ledger
- **Chart of Accounts**:
    - Assets: Accounts Receivable, Cash/Bank.
    - Liabilities: Security Deposits Held, Prepaid Rent.
    - Income: Rental Income, Parking Income, Late Fee Income.
    - Expenses: Maintenance, Utilities, Management Fees.
- **Journal Entries**:
    - Every transaction must balance (Sum Debits = Sum Credits).
    - Immutable: No editing/deleting. Corrections via reversing entries.

### 3.3 Payment Reconciliation
- Map incoming payments to specific invoices.
- Handle overpayments (Credit Balance) and underpayments (Partial Payment).

## 4. Data Model

### Invoice
- `id` (UUID, PK)
- `lease_id` (FK)
- `invoice_number` (Sequential per tenant)
- `issue_date`, `due_date`
- `period_start`, `period_end`
- `amount_due`, `currency`
- `status`
- `line_items` (JSON)

### Payment
- `id` (UUID, PK)
- `invoice_id` (FK)
- `amount`
- `method` (Stripe, Cash, Check)
- `date`
- `status` (Completed, Failed, Refunded)

### LedgerEntry
- `id` (UUID, PK)
- `journal_id` (Grouping ID for the transaction)
- `account_code` (e.g., 1100 - AR, 4000 - Rent Income)
- `debit` (amount)
- `credit` (amount)
- `description`
- `correlation_id` (Link to Invoice/Payment ID)

## 5. API Endpoints

### Invoices
- `GET /invoices`: List invoices (filter by tenant/status).
- `POST /invoices`: Create manual invoice.
- `GET /invoices/:id/pdf`: Download PDF.

### Payments
- `POST /payments`: Record a payment.
- `GET /payments`: History.

### Ledger
- `GET /ledger`: View journal entries (Admin/Accountant view).
- `GET /reports/balance-sheet`: Generated from ledger.

## 6. Integration Points
- **Property Service**: Listens for `LeaseActivated` events to set up billing schedules.
- **Payments Service**: Receives webhook events to record online payments.
