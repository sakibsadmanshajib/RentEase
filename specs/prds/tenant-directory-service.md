# PRD: Tenant & Directory Service

## 1. Overview
The Tenant & Directory Service manages the lifecycle of "Tenants" (Landlord Organizations) and the directory of people associated with them (Staff, Agents, Vendors). Note: In this context, "Tenant" refers to the SaaS customer (the Landlord/Property Management Company), not the renter. The renter is a "Person" or "Occupant" managed in the Property Service, though they may have a User account here for portal access.

## 2. User Stories

### Organization Management
- **As a Landlord**, I want to create a new Organization (Tenant) so that I can manage my properties.
- **As a Landlord**, I want to configure my organization's settings (Timezone, Currency, Tax Region).
- **As a Landlord**, I want to invite staff members (Property Managers, Maintenance Agents) to my organization via email.

### Directory
- **As a Property Manager**, I want to view a directory of all staff and vendors associated with the organization.
- **As a System**, I want to ensure that data is strictly isolated between different organizations.

## 3. Functional Requirements

### 3.1 Tenant Lifecycle
- Create, Update, Suspend, Delete Tenant Organizations.
- Manage subscription status (Active, Trial, Suspended) - *Integration with Billing*.

### 3.2 Staff Management
- Invite users to join an organization.
- Manage staff roles (Admin, Manager, Agent).
- Remove staff access.

### 3.3 Configuration
- Store organization-wide settings:
    - Default Currency (USD/CAD)
    - Date Format
    - Timezone
    - Emergency Contact Info

## 4. Data Model

### Tenant (Organization)
- `id` (UUID, PK)
- `name`
- `slug` (Unique, for subdomains/URLs)
- `contact_email`
- `contact_phone`
- `address_line1`, `address_line2`, `city`, `state`, `zip`, `country`
- `settings` (JSON: currency, timezone, etc.)
- `subscription_status`
- `created_at`, `updated_at`

### Invitation
- `id` (UUID, PK)
- `tenant_id` (FK)
- `email`
- `role_id`
- `token`
- `expires_at`
- `status` (Pending, Accepted, Expired)

## 5. API Endpoints

### Tenants
- `POST /tenants`: Create a new organization.
- `GET /tenants/:id`: Get organization details.
- `PATCH /tenants/:id`: Update organization settings.
- `DELETE /tenants/:id`: Request deletion/cancellation.

### Invitations
- `POST /tenants/:id/invitations`: Invite a user.
- `GET /tenants/:id/invitations`: List pending invitations.
- `POST /invitations/:token/accept`: Accept an invitation.

### Directory
- `GET /tenants/:id/members`: List all members of the organization.
- `DELETE /tenants/:id/members/:userId`: Remove a member.

## 6. Integration Points
- **Identity Service**: To link Users to Tenants via `UserTenantMembership`.
- **Billing Service**: To update subscription status based on payments.
