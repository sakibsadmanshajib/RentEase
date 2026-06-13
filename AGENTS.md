# AGENTS.md

Guidance for AI coding agents working in the RentEase monorepo.

## Project overview

RentEase is a property management SaaS built as a pnpm + Turborepo monorepo:

- **Backend**: 5 NestJS microservices + API gateway
- **Frontend**: Next.js 16 (`apps/web`)
- **Database**: PostgreSQL 15 (shared `rentease` database)
- **Testing**: Jest (unit), Playwright (API + E2E)

## Cursor Cloud specific instructions

Cloud agents run on Ubuntu VMs configured via [`.cursor/environment.json`](.cursor/environment.json). The `install` script [`scripts/setup-cloud-env.sh`](scripts/setup-cloud-env.sh) handles:

- Node 24 + pnpm install
- Building shared packages (`@rentease/common`, `@rentease/auth`)
- PostgreSQL database creation
- Per-service `.env` file generation (only if missing)
- Database migrations for all 4 backend services

PostgreSQL is started automatically via the `start` command in `environment.json`.

### Service ports

| Service | Port | Filter name |
|---------|------|-------------|
| web | 3000 | `web` |
| identity-service | 3001 | `identity-service` |
| property-service | 3003 | `property-service` |
| billing-service | 3004 | `billing-service` |
| organization-service | 3005 | `@rentease/organization-service` |
| api-gateway | 4000 | `api-gateway` |

### Starting services

```bash
# All services
pnpm turbo dev

# Individual service
pnpm --filter identity-service dev
pnpm --filter web dev
```

Services are **not** auto-started in background terminals. Start only what you need for the current task.

### Running tests

```bash
# Unit tests (no running services required)
pnpm test:unit

# API integration tests (requires relevant services running)
pnpm test:api

# E2E browser tests (requires full stack + Playwright browsers)
# Requires @playwright/test@^1.60.0 on Node 24.16+ (older versions hang during install)
pnpm exec playwright install chromium
pnpm test:e2e
```

### Secrets

The setup script generates dev secrets automatically. To override, set these in the Cursor Cloud Agents Secrets tab:

| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_SECRET` | No | Auto-generated if unset; must match across all backends |
| `ENCRYPTION_KEY` | No | Auto-generated (32 chars); required by identity-service |
| `SERVICE_SECRET` | No | Auto-generated; shared by identity + organization services |
| `GOOGLE_CLIENT_ID` | Only for OAuth | Needed for Google login flows and related E2E tests |
| `GOOGLE_CLIENT_SECRET` | Only for OAuth | Needed for Google login flows and related E2E tests |

### Common commands

```bash
pnpm turbo build          # Build all apps
pnpm turbo lint           # Lint all apps
pnpm --filter identity-service migrate   # Run migrations for one service
bash scripts/migrate-all.sh              # Run all migrations
```

### Gotchas

- Each backend service loads its own `.env` from its service directory (not a root `.env`).
- `JWT_SECRET` must be identical across identity, organization, property, and billing services.
- Google OAuth uses placeholder empty values by default; email/password auth works without OAuth secrets.
- The organization service was renamed from `tenant-service`; some legacy scripts may reference the old name.
