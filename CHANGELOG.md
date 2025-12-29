# Changelog

All notable changes to RentEase are documented here.

## [Unreleased]

### Added

- **Multi-Tenancy Security** - Complete JWT-based tenant isolation across all services
- **Tenant Onboarding Flow** - New users redirected to create organization before accessing dashboard
- **Occupants Page** - New dashboard page for managing renters (separate from "Tenants"/organizations)
- **Service Configuration** - Each microservice now has its own `.env` file
- **Documentation** - Comprehensive wiki pages for security, configuration, and getting started

### Changed

- **Auth Redirect** - Login now redirects to `/dashboard` instead of non-existent `/portal`
- **Sidebar** - Removed confusing "Tenants" and "Tenant Portal" links; added "Occupants"
- **Backend Controllers** - All controllers now use `JwtAuthGuard` and pass `tenantId` to services
- **Service AppModules** - Load `.env` from service directory, not root

### Fixed

- **Property Service** - `findAll` now returns empty array instead of all properties when no tenant
- **Lease Service** - Added mandatory `tenantId` filtering to all methods
- **Billing Service** - `findAll` now requires `tenantId` and filters properly
- **Tenant Service DTOs** - Fixed to use `name` instead of `firstName/lastName`

### Security

- All dashboard pages check for tenant context before rendering
- Backend services reject requests without valid tenant context
- No cross-tenant data access possible

## [0.1.0] - 2024-12-01

### Added

- Initial microservices implementation
- Identity Service with Google OAuth and email/password auth
- Tenant Service for organization management
- Property Service for properties, units, and leases
- Billing Service for invoices and payments
- Next.js web frontend with dashboard
- E2E test suite with Playwright
- GitHub Actions CI/CD pipeline
