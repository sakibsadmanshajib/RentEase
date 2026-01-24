# RentEase

RentEase is a comprehensive property management solution designed for landlords and property managers. It features a microservices architecture to ensure scalability, maintainability, and security.

## 🚀 Current State

- **Microservices**: 5 active services (Identity, Tenant, Property, Billing, Gateway).
- **Frontend**: Functional Next.js Dashboard for Property, Tenant, Lease, and Billing management.
- **Testing**:
  - Unit Tests: High coverage for Billing service.
  - API Integration Tests: **68 passed** (Covering all critical flows).
  - E2E Tests: **36 passed** (Covering Auth, Google Login, Dashboard navigation).
- **Security**: JWT-based Authentication with strict Multi-tenancy enforcement.

## 🛠 Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js, TailwindCSS
- **Tooling**: Turborepo, pnpm, Playwright, Jest

## 🏗 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.

## 🧪 Running Tests

### Prerequisites

- Node.js v24 (Use `nvm use 24`)
- pnpm
- PostgreSQL running locally

### Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm turbo build

# Run Unit Tests
pnpm turbo test:unit

# Run E2E Tests
npx playwright test
```

## 🔮 Future Plans

- **Deploy to AWS/GCP**: Containerize services with Docker/Kubernetes.
- **Real Payment Integration**: Replace mock payments with Stripe/PayPal.
- **Notifications**: Add email/SMS notifications for due invoices.
- **Advanced Reporting**: Analytics dashboard for revenue and occupancy rates.

## Known Issues

- `tenant-crud` E2E test may timeout due to frontend form latency in test environment.
- `billing-lifecycle` test requires strictly serialized execution.
