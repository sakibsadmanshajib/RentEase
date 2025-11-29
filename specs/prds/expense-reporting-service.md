# PRD: Expense & Reporting Service

## 1. Overview
The Expense & Reporting Service aggregates financial data from the Billing & Ledger Service and operational data from the Ticketing Service to provide comprehensive financial insights. It also handles the generation of PDF statements for tax and record-keeping purposes.

## 2. User Stories

### Expense Tracking
- **As a Landlord**, I want to record an expense (e.g., "Snow Removal") manually.
- **As a Landlord**, I want to set up recurring expenses (e.g., "Internet Bill") so I don't have to enter them every month.
- **As a System**, I want to automatically create an expense record when a maintenance ticket is closed with a final cost.

### Reporting
- **As a Landlord**, I want to see a P&L (Profit & Loss) statement for a specific property over a specific date range.
- **As a Landlord**, I want to generate a yearly rent statement for a tenant to help them with their taxes.
- **As a Landlord**, I want to export my data to CSV/PDF for my accountant.

## 3. Functional Requirements

### 3.1 Expense Management
- Categories: Repair, Utilities, Insurance, Tax, Management Fees, etc.
- Recurring Expenses: Monthly, Quarterly, Yearly.
- Link to Property/Unit/Ticket.

### 3.2 Report Generation
- **Income Statement**: Aggregates income from Ledger and expenses from Expense table.
- **Tenant Statement**: Aggregates payments from Billing Service.
- **Format**: JSON for dashboards, PDF for download.

## 4. Data Model

### Expense
- `id` (UUID, PK)
- `tenant_id` (FK)
- `property_id` (FK)
- `unit_id` (FK)
- `ticket_id` (FK - Optional)
- `category`
- `description`
- `amount`, `currency`
- `date_incurred`
- `is_recurring`
- `recurrence_rule` (e.g., RRule string)

## 5. API Endpoints

### Expenses
- `POST /expenses`: Create expense.
- `GET /expenses`: List expenses.
- `GET /expenses/categories`: List available categories.

### Reports
- `GET /reports/pnl`: Profit & Loss summary.
- `GET /reports/tenant-statement`: Yearly statement.
- `GET /reports/export`: Request a data export.

## 6. Integration Points
- **Billing Service**: Source of Income data.
- **Ticketing Service**: Source of repair costs.
