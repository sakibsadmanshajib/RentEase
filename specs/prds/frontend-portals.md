# PRD: Frontend Portals

## 1. Overview
RentEase provides three distinct web portals tailored to specific user roles. These portals share a common design system and authentication layer but offer vastly different functionality.

## 2. Portals

### 2.1 Tenant Portal
**Target Audience**: Renters living in units.
**Goal**: Self-service for payments and maintenance.

**Key Features**:
- **Dashboard**: Overview of current balance, next rent due date, and open tickets.
- **My Lease**: View active lease details, download signed PDF.
- **Payments**:
    - Pay rent via Card/ACH.
    - Set up Autopay.
    - View payment history and download receipts.
- **Maintenance**:
    - Open a new ticket (with photos).
    - Chat with property manager on existing tickets.
- **Messages**: Direct messages with the Landlord for non-maintenance issues.
- **Documents**: Upload insurance proof, view building rules.

### 2.2 Landlord Portal
**Target Audience**: Landlords, Property Managers, Staff.
**Goal**: Operational efficiency and financial oversight.

**Key Features**:
- **Dashboard**: High-level metrics (Occupancy Rate, Rent Collected %, Open Tickets).
- **Properties**: Manage properties, units, and active leases.
- **CRM**: Directory of tenants and applicants.
- **Financials**:
    - General Ledger view.
    - Invoices (Create/Void).
    - Record offline payments.
    - Expense tracking.
- **Ticketing**: Kanban board or list view of open tickets. Assign staff, add internal notes.
- **Reports**: Generate P&L and Tax statements.

### 2.3 Admin Portal
**Target Audience**: RentEase System Administrators (Internal).
**Goal**: Platform management and support.

**Key Features**:
- **Tenant Management**: View all Landlord Organizations (Tenants). Suspend/Activate accounts.
- **User Management**: Global user search. Impersonation (for support).
- **Audit Logs**: View system-wide security logs.
- **Feature Flags**: Toggle features for specific tenants.

## 3. Shared Requirements

### 3.1 Design System
- **Theme**: Premium Dark Mode (HSL based).
- **Responsive**: Mobile-first design for all portals.
- **Components**: Shared UI library (Buttons, Inputs, Tables, Modals).

### 3.2 Authentication
- Unified login page (`/auth/login`).
- Role-based redirection upon login (Tenant -> `/portal`, Landlord -> `/dashboard`, Admin -> `/admin`).

## 4. Technical Architecture
- **Framework**: Next.js (App Router).
- **State Management**: React Query / SWR for server state.
- **Styling**: Tailwind CSS.
- **Routing**:
    - `/dashboard/*` (Landlord)
    - `/portal/*` (Tenant)
    - `/admin/*` (Admin)
