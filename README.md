# RentEase

**Production-Grade, Multi-Service Rental Property Management SaaS**

RentEase is a B2B, multi-tenant SaaS platform designed for small-to-mid landlords in the US and Canada. It provides a comprehensive solution for managing properties, units, leases, tenants, and financials with a focus on security, data privacy, and double-entry accounting.

## 🚀 Project Overview

RentEase follows **Domain-Driven Design (DDD)** principles and utilizes a **microservices architecture** (logically separated within a monorepo).

### Core Capabilities

- **Multi-Tenancy:** robust organization management with staff/agent roles and permissions.
- **Property Management:** Complete lifecycle management for Properties, Units, and Leases.
- **Tenant Portal:** Allows tenants to view leases, pay rent, and submit maintenance tickets.
- **Financials:** Double-entry ledger for accurate accounting, invoicing, and expense tracking.
- **Security:** PII minimization and encryption, RBAC, and audit logging.

## 🛠 Tech Stack

- **Monorepo:** [Turborepo](https://turbo.build/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Backend:** [NestJS](https://nestjs.com/) (TypeScript)
- **Frontend:** [Next.js](https://nextjs.org/) (React, Tailwind CSS)
- **Database:** PostgreSQL
- **Infrastructure:** Docker

## 📂 Architecture

The application is decomposed into the following domain services:

- **Identity & Access Service:** Users, roles, permissions, authentication.
- **Tenant & Directory Service:** Landlord organizations, staff directory.
- **Property & Lease Service:** Properties, units, leases, occupants.
- **Billing & Ledger Service:** Invoices, payments, accounting ledger.
- **Ticketing & Work Orders Service:** Maintenance requests.
- **Messaging Service:** Direct messaging.
- **Document Management Service:** File storage and management.
- **Expense & Reporting Service:** Analytics and reports.
- **Audit & Compliance Service:** System-wide audit logs.

For detailed architecture specifications, please refer to the [Project Wiki](https://github.com/sakibsadmanshajib/RentEase/wiki).

## 🚦 Getting Started

### Prerequisites

- Node.js
- pnpm
- Docker (for local database)

### Installation

```bash
# Install dependencies
pnpm install
```

### Running the App

```bash
# Start development servers
pnpm dev
```

### Building

```bash
# Build the project
pnpm build
```

## ✅ Verification

The project includes scripts to verify the functionality of core services:

- **Identity Service:** `./scripts/verify-identity.sh`
- **Tenant Service:** `./scripts/verify-tenant.sh`
- **Property Service:** `./scripts/verify-property.sh`

## 📝 Documentation

- [Architecture Spec](https://github.com/sakibsadmanshajib/RentEase/wiki/Architecture)
- [Master Implementation Plan](https://github.com/sakibsadmanshajib/RentEase/wiki/Master-Implementation-Plan)
- [Design Decisions](https://github.com/sakibsadmanshajib/RentEase/wiki/Design-Decisions)
- [Testing Strategy](https://github.com/sakibsadmanshajib/RentEase/wiki/Testing-Strategy)

## 🧪 Testing

The project maintains a comprehensive E2E test suite using Playwright.

### Verified Critical Paths

- **Tenant CRUD**: Landlord organization management.
- **Property CRUD**: Property and Unit lifecycle.
- **Lease CRUD**: Lease creation, activation, and termination.
- **Billing CRUD**: Invoice generation, payments, and ledger entries.

### Running Tests

```bash
# Run full E2E suite
npx playwright test

# View HTML Report
npx playwright show-report
```
