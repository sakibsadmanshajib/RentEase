# RentEase

**Production-Grade, Multi-Service Rental Property Management SaaS**

RentEase is a B2B, multi-tenant SaaS platform designed for small-to-mid landlords in the US and Canada. It provides a comprehensive solution for managing properties, units, leases, tenants, and financials with a focus on security, data privacy, and double-entry accounting.

## 🚀 Project Overview

RentEase follows **Domain-Driven Design (DDD)** principles and utilizes a **microservices architecture** (logically separated within a monorepo).

### Core Capabilities

- **Multi-Tenancy:** Robust organization management with complete data isolation between landlords.
- **Property Management:** Complete lifecycle management for Properties, Units, and Leases.
- **Occupant Management:** Track renters and their contact information.
- **Financials:** Double-entry ledger for accurate accounting, invoicing, and expense tracking.
- **Security:** JWT-based tenant isolation, PII encryption, RBAC, and audit logging.

## 🛠 Tech Stack

- **Monorepo:** [Turborepo](https://turbo.build/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Backend:** [NestJS](https://nestjs.com/) (TypeScript)
- **Frontend:** [Next.js](https://nextjs.org/) (React, Tailwind CSS)
- **Database:** PostgreSQL
- **Infrastructure:** Docker

## 📂 Architecture

The application is decomposed into self-contained domain services:

| Service                        | Port | Status         |
| ------------------------------ | ---- | -------------- |
| **Web Frontend**               | 3000 | ✅ Implemented |
| **Identity & Access Service**  | 3001 | ✅ Implemented |
| **Tenant & Directory Service** | 3002 | ✅ Implemented |
| **Property & Lease Service**   | 3003 | ✅ Implemented |
| **Billing & Ledger Service**   | 3004 | ✅ Implemented |
| Ticketing & Work Orders        | -    | 📋 Planned     |
| Messaging Service              | -    | 📋 Planned     |
| Document Management            | -    | 📋 Planned     |
| Expense & Reporting            | -    | 📋 Planned     |
| Audit & Compliance             | -    | 📋 Planned     |

For detailed architecture specifications, please refer to the [Project Wiki](https://github.com/sakibsadmanshajib/RentEase/wiki).

## 🚦 Getting Started

### Prerequisites

- Node.js 24+ (use nvm: `nvm use 24`)
- pnpm
- Docker (for PostgreSQL, Redis, RabbitMQ)

### Installation

```bash
# Clone the repository
git clone https://github.com/sakibsadmanshajib/RentEase.git
cd RentEase

# Install dependencies
pnpm install

# Start infrastructure
docker compose up -d

# Copy environment files
cp apps/identity-service/.env.sample apps/identity-service/.env
cp apps/tenant-service/.env.sample apps/tenant-service/.env
cp apps/property-service/.env.sample apps/property-service/.env
cp apps/billing-service/.env.sample apps/billing-service/.env

# Start development servers
pnpm dev
```

### Access the Application

- **Web App:** http://localhost:3000
- **Identity Service:** http://localhost:3001
- **Tenant Service:** http://localhost:3002
- **Property Service:** http://localhost:3003
- **Billing Service:** http://localhost:3004

## 🔐 Security

RentEase implements comprehensive multi-tenancy security:

- **JWT-based tenant isolation:** All API calls are scoped to the user's organization
- **Backend enforcement:** Every service validates tenant context from JWT tokens
- **Frontend enforcement:** Pages redirect to onboarding if no organization membership
- **No cross-tenant access:** Data is strictly isolated between organizations

See the [Multi-Tenancy Security](https://github.com/sakibsadmanshajib/RentEase/wiki/Multi-Tenancy-Security) wiki page for details.

## 🧪 Testing

The project maintains a comprehensive E2E test suite using Playwright.

```bash
# Run all tests
pnpm test:ci

# Run API tests only
pnpm test:api

# Run E2E tests only
pnpm test:e2e

# View HTML Report
pnpm exec playwright show-report
```

### Verified Critical Paths

- ✅ User authentication (Google OAuth, email/password)
- ✅ Organization management (create, update, delete)
- ✅ Property CRUD and unit lifecycle
- ✅ Lease creation, activation, and termination
- ✅ Invoice generation, payments, and ledger entries

## 📝 Documentation

- [Getting Started](https://github.com/sakibsadmanshajib/RentEase/wiki/Getting-Started)
- [Architecture](https://github.com/sakibsadmanshajib/RentEase/wiki/Architecture)
- [Multi-Tenancy Security](https://github.com/sakibsadmanshajib/RentEase/wiki/Multi-Tenancy-Security)
- [Service Configuration](https://github.com/sakibsadmanshajib/RentEase/wiki/Service-Configuration)
- [Design Decisions](https://github.com/sakibsadmanshajib/RentEase/wiki/Design-Decisions)
- [Testing Strategy](https://github.com/sakibsadmanshajib/RentEase/wiki/Testing-Strategy)

## 📋 Recent Changes (December 2024)

- ✅ Implemented JWT-based multi-tenancy security across all services
- ✅ Created tenant onboarding flow for new users
- ✅ Made each microservice self-contained with its own `.env` configuration
- ✅ Fixed Google OAuth callback redirect issues
- ✅ Added Occupants page for managing renters
- ✅ Updated dashboard to use real tenant context

## 📄 License

Private - All rights reserved.
