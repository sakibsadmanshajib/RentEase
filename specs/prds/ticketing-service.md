# PRD: Ticketing & Work Orders Service

## 1. Overview
The Ticketing & Work Orders Service manages maintenance requests and general inquiries. It facilitates communication between Tenants and Landlords/Staff regarding issues, tracks the progress of repairs, and links to expenses for financial tracking.

## 2. User Stories

### Ticket Creation
- **As a Tenant**, I want to report a maintenance issue (e.g., "Leaky Faucet") with a description and photos.
- **As a Landlord**, I want to see a dashboard of open tickets prioritized by urgency.
- **As a System**, I want to automatically assign tickets to the property manager responsible for that building.

### Ticket Management
- **As a Landlord**, I want to change the status of a ticket (Open -> In Progress -> Done).
- **As a Landlord**, I want to add internal notes that the tenant cannot see.
- **As a Tenant**, I want to comment on the ticket to provide more info or ask for updates.

### Quotes & Expenses
- **As a Landlord**, I want to record quotes from vendors for a repair.
- **As a Landlord**, I want to convert a completed ticket into an Expense so it appears on my P&L.

## 3. Functional Requirements

### 3.1 Ticket Lifecycle
- Statuses: Open, Waiting for Info, In Progress, Resolved, Cancelled.
- Priorities: Low, Medium, High, Emergency.

### 3.2 Communication
- Threaded comments per ticket.
- Support for "Internal" vs "Public" comments.
- Email notifications on new comments/status changes.

### 3.3 Emergency Handling
- If a tenant selects "Emergency", display the property's emergency contact info immediately.

## 4. Data Model

### Ticket
- `id` (UUID, PK)
- `tenant_id` (FK)
- `property_id` (FK)
- `unit_id` (FK)
- `title`
- `description`
- `priority`
- `status`
- `assigned_to` (User ID)
- `created_by` (User ID)

### TicketComment
- `id` (UUID, PK)
- `ticket_id` (FK)
- `user_id` (FK)
- `body`
- `is_internal` (boolean)
- `created_at`

### TicketQuote
- `id` (UUID, PK)
- `ticket_id` (FK)
- `vendor_name`
- `amount`
- `status` (Pending, Approved, Rejected)

## 5. API Endpoints

- `POST /tickets`: Create ticket.
- `GET /tickets`: List tickets (filter by status/property).
- `GET /tickets/:id`: Details.
- `POST /tickets/:id/comments`: Add comment.
- `PATCH /tickets/:id/status`: Update status.

## 6. Integration Points
- **Document Service**: Store photos attached to tickets.
- **Expense Service**: Create an expense record linked to a resolved ticket.
