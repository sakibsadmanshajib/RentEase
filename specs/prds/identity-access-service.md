# PRD: Identity & Access Service

## 1. Overview
The Identity & Access Service is the central authority for authentication and authorization in RentEase. It manages users, roles, permissions, and secure access to all other services. It supports multi-tenancy, meaning a single user identity can belong to multiple tenant organizations (e.g., a property manager working for multiple landlords).

## 2. User Stories

### Authentication
- **As a User**, I want to sign up with my email and password so that I can access the platform.
- **As a User**, I want to log in securely so that I can access my account.
- **As a User**, I want to reset my password if I forget it via a secure email link.
- **As a System**, I want to enforce password complexity rules (length, special characters) to ensure security.
- **As a User**, I want to use MFA (Multi-Factor Authentication) for an extra layer of security (Future).

### Authorization & RBAC
- **As an Admin**, I want to assign roles (e.g., Landlord, Property Manager, Tenant) to users within an organization.
- **As a System**, I want to verify a user's permissions before allowing access to specific resources (e.g., `lease.write`).
- **As a User**, I want to switch between different organizations I belong to without logging out.

## 3. Functional Requirements

### 3.1 Authentication
- Support Email/Password login.
- Support OAuth2/OIDC (Google, Microsoft) - *Future*.
- Issue JWTs (JSON Web Tokens) upon successful login.
- JWT payload must include `user_id`, `email`, and current `tenant_id` context.
- Refresh Token rotation for session management.

### 3.2 Authorization
- Implement Role-Based Access Control (RBAC).
- Roles are scoped to a Tenant (Organization).
- A user can have different roles in different tenants.
- Permissions are fine-grained (e.g., `property.create`, `invoice.read`).

### 3.3 User Management
- CRUD operations for Users.
- Profile management (name, phone, avatar).
- Secure storage of PII (hashed passwords).

## 4. Data Model

### User
- `id` (UUID, PK)
- `email` (Unique, Indexed)
- `password_hash`
- `first_name`
- `last_name`
- `phone`
- `is_active`
- `created_at`, `updated_at`

### Role
- `id` (UUID, PK)
- `name` (e.g., "Admin", "Tenant")
- `description`
- `is_system_role` (boolean)

### Permission
- `id` (UUID, PK)
- `slug` (e.g., `lease.create`)
- `description`

### RolePermission
- `role_id` (FK)
- `permission_id` (FK)

### UserTenantMembership
- `user_id` (FK)
- `tenant_id` (FK - Logical link to Tenant Service)
- `role_id` (FK)
- `is_active`

## 5. API Endpoints

### Auth
- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Authenticate and receive tokens.
- `POST /auth/refresh`: Refresh access token.
- `POST /auth/logout`: Invalidate session.
- `POST /auth/forgot-password`: Initiate password reset.
- `POST /auth/reset-password`: Complete password reset.

### Users
- `GET /users/me`: Get current user profile.
- `PATCH /users/me`: Update profile.
- `GET /users/:id`: Get user details (Admin only).

### Roles & Permissions
- `GET /roles`: List available roles.
- `POST /roles`: Create a custom role (Admin only).
- `GET /permissions`: List all system permissions.

## 6. Security Considerations
- Passwords must be hashed using Argon2 or bcrypt.
- Rate limiting on login endpoints to prevent brute-force attacks.
- PII (email, phone) should be encrypted at rest if required by compliance.
- All internal communication via TLS.
