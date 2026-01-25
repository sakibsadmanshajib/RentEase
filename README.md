# RentEase

**Modern Property Management SaaS** - A comprehensive platform for landlords and property managers to manage properties, leases, tenants, and billing.

[![Node.js](https://img.shields.io/badge/Node.js-24+-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)]()

---

## 🚀 Current State (January 2026)

### Completed (Phase 1-2)

| Domain             | Status      | Features                                              |
| ------------------ | ----------- | ----------------------------------------------------- |
| **Authentication** | ✅ Complete | JWT HTTP-only cookies, Google OAuth, refresh rotation |
| **Organizations**  | ✅ Complete | CRUD, invitations, staff management                   |
| **Properties**     | ✅ Complete | CRUD, address, units management                       |
| **Units**          | ✅ Complete | Bedrooms, bathrooms, status tracking                  |
| **Leases**         | ✅ Complete | Full lifecycle (Draft → Active → Terminated)          |
| **Occupants**      | ✅ Basic    | First/last name, email, phone, role                   |
| **Invoices**       | ✅ Complete | CRUD with ledger integration                          |
| **Payments**       | ✅ Basic    | Manual recording (no provider integration yet)        |
| **Expenses**       | ✅ Complete | One-time and recurring with ledger                    |
| **Ledger**         | ✅ Complete | Double-entry accounting                               |

### Testing

- **API Integration Tests**: Comprehensive coverage for all services
- **E2E Tests**: Auth, Dashboard, CRUD flows via Playwright
- **CI/CD**: GitHub Actions with automated test runs

---

## 🛠 Tech Stack

| Layer        | Technology                                |
| ------------ | ----------------------------------------- |
| **Backend**  | NestJS 11, Sequelize, PostgreSQL          |
| **Frontend** | Next.js 15, TailwindCSS, shadcn/ui        |
| **Monorepo** | Turborepo, pnpm workspaces                |
| **Testing**  | Playwright (E2E), Jest (Unit/Integration) |
| **Auth**     | JWT (HTTP-only cookies), Google OAuth     |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           API Gateway                                │
│                    (Auth, Routing, Rate Limiting)                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Identity Service│    │Property Service │    │ Billing Service │
│ - Auth          │    │ - Properties    │    │ - Invoices      │
│ - Users         │    │ - Units         │    │ - Payments      │
│ - RBAC          │    │ - Leases        │    │ - Expenses      │
└─────────────────┘    │ - Occupants     │    │ - Ledger        │
                       └─────────────────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│  Org Service    │
│ - Organizations │
│ - Invitations   │
│ - Memberships   │
└─────────────────┘
```

For detailed architecture, see the [Wiki](https://github.com/sakibsadmanshajib/RentEase/wiki/).

---

## 📚 Documentation

All detailed documentation lives in the [`wiki/`](https://github.com/sakibsadmanshajib/RentEase/wiki/) folder:

### Core Docs

- [Architecture](https://github.com/sakibsadmanshajib/RentEase/wiki/Architecture) - System design
- [Master Implementation Plan](https://github.com/sakibsadmanshajib/RentEase/wiki/Master-Implementation-Plan) - Roadmap

### Product Requirements (PRDs)

- [Gap Analysis PRD](https://github.com/sakibsadmanshajib/RentEase/wiki/Gap-Analysis-PRD) - Industry comparison
- [Tenant Portal PRD](https://github.com/sakibsadmanshajib/RentEase/wiki/Tenant-Portal-PRD) - Tenant self-service
- [Landlord Tenant Profile PRD](https://github.com/sakibsadmanshajib/RentEase/wiki/Landlord-Tenant-Profile-PRD) - 360° tenant view
- [Feature Tiers PRD](https://github.com/sakibsadmanshajib/RentEase/wiki/Feature-Tiers-and-Organization-Settings-PRD) - Pricing tiers
- [Integration Adapter PRD](https://github.com/sakibsadmanshajib/RentEase/wiki/Third-Party-Integration-Adapter-Architecture-PRD) - Vendor abstraction

### Technical Docs

- [Inter-Service Communication](https://github.com/sakibsadmanshajib/RentEase/wiki/Inter-Service-Communication-PRD) - Service mesh design
- [Known Limitations](https://github.com/sakibsadmanshajib/RentEase/wiki/Known-Limitations) - Technical debt

---

## 🧪 Development

### Prerequisites

- Node.js v24+ (`nvm use 24`)
- pnpm 9+
- PostgreSQL 15+
- Docker (optional, for containerized DB)

### Quick Start

```bash
# Clone and install
git clone <repo-url>
cd RentEase
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm turbo migrate

# Start all services (dev mode)
pnpm turbo dev

# Or start specific service
pnpm --filter api-gateway dev
pnpm --filter web dev
```

### Testing

```bash
# Run all tests
pnpm turbo test

# Run E2E tests
cd apps/web && npx playwright test

# Run with UI
npx playwright test --ui
```

---

## 🔮 Roadmap

### Phase 2.6: Architecture Overhaul (Current Priority)

- [ ] Zero Trust cross-service validation
- [ ] Enhanced data models (15+ missing fields per model)
- [ ] Integration adapter layer

### Phase 3: Core Features

- [ ] **Tenant Portal**: Online payments, maintenance requests, ledger view
- [ ] **Stripe Integration**: ACH + Card payments via adapter pattern
- [ ] **Tenant Screening**: TransUnion/Experian integration
- [ ] **Property Inspections**: Move-in/out checklists with photos

### Phase 4: Operations

- [ ] **Vendor Management**: Contractor tracking, work orders
- [ ] **Notifications**: Email (SendGrid) + SMS (Twilio)
- [ ] **Document Service**: S3 storage, signed URLs

### Phase 5: Monetization

- [ ] **Feature Tiers**: Free → Starter → Pro → Business
- [ ] **Stripe Billing**: Subscription management
- [ ] **Per-Org Settings**: Custom feature flags

---

## 📊 Comparison to Industry

Based on [Gap Analysis PRD](https://github.com/sakibsadmanshajib/RentEase/wiki/Gap-Analysis-PRD):

| Feature             | TenantCloud | Buildium | RentEase   |
| ------------------- | ----------- | -------- | ---------- |
| Property Management | ✅          | ✅       | ✅         |
| Lease Management    | ✅          | ✅       | ✅         |
| Online Payments     | ✅          | ✅       | 🔜 Planned |
| Tenant Screening    | ✅          | ✅       | 🔜 Planned |
| Tenant Portal       | ✅          | ✅       | 🔜 Planned |
| Owner Portal        | ✅          | ✅       | 🔜 Planned |
| Vendor Management   | ✅          | ✅       | 🔜 Planned |
| API Access          | ✅          | ✅       | 🔜 Planned |

---

## 🔐 Security

- **Multi-Tenancy**: Strict org isolation via `orgId` on all queries
- **Authentication**: JWT in HTTP-only cookies, refresh token rotation
- **Encryption**: PII encrypted at rest (phone, SSN)
- **RBAC**: Role-based access control per organization

> ⚠️ **Known Gap**: Zero Trust cross-service validation not yet implemented. See [Known Limitations](https://github.com/sakibsadmanshajib/RentEase/wiki/Known-Limitations).

---

## 📁 Project Structure

```
RentEase/
├── apps/
│   ├── api-gateway/        # Request routing, auth
│   ├── identity-service/   # Users, auth, RBAC
│   ├── organization-service/ # Orgs, invitations
│   ├── property-service/   # Properties, units, leases
│   ├── billing-service/    # Invoices, payments, ledger
│   └── web/                # Next.js frontend
├── packages/
│   ├── auth/               # Shared auth utilities
│   ├── common/             # Shared NestJS utilities
│   └── ui/                 # Shared React components
├── wiki/                   # Documentation
└── turbo.json              # Monorepo config
```

---

## 🤝 Contributing

1. Check [Known Limitations](https://github.com/sakibsadmanshajib/RentEase/wiki/Known-Limitations) for areas needing work
2. Review relevant PRD in `wiki/` before implementing
3. Write tests for new features
4. Submit PR with clear description

---

## 📄 License

Proprietary - All Rights Reserved
