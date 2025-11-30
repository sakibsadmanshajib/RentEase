# Design Decisions Log

This document records key architectural and design decisions for RentEase.

## 1. Monorepo Structure
- **Decision**: Use a Monorepo managed by Turborepo and pnpm.
- **Context**: We have multiple backend services and a frontend application that share code (DTOs, utilities) and configuration.
- **Consequences**:
    - **Pros**: Simplified dependency management, atomic commits across services, shared tooling.
    - **Cons**: CI complexity (mitigated by Turbo), potential for tight coupling if not careful.

## 2. Backend Framework: NestJS
- **Decision**: Use NestJS for all backend services.
- **Context**: We need a robust, opinionated framework that supports TypeScript, Dependency Injection, and modular architecture.
- **Consequences**:
    - **Pros**: Consistency across services, built-in support for Microservices, strong typing.
    - **Cons**: Learning curve, boilerplate.

## 3. Database Strategy: Logical Separation
- **Decision**: Each service owns its own data. No cross-service database joins.
- **Context**: To ensure loose coupling and independent scalability of services.
- **Consequences**:
    - **Pros**: Services can evolve independently, clearer boundaries.
    - **Cons**: Data consistency requires eventual consistency patterns (events), complex queries (aggregation).
    - **Mitigation**: Use "Reference IDs" (e.g., `tenantId`, `userId`) and fetch data via API/Events when needed.

## 4. Financial Integrity: Double-Entry Ledger
- **Decision**: Implement a core Double-Entry Ledger for all financial transactions.
- **Context**: Rental management involves complex money movements (rent, deposits, expenses) and requires strict auditability.
- **Consequences**:
    - **Pros**: Error detection, full audit trail, standard accounting compliance.
    - **Cons**: Higher implementation complexity than simple "balance" columns.

## 5. Security: Field-Level Encryption
- **Decision**: Encrypt sensitive PII (names, phones) at the field level in the database.
- **Context**: To protect user privacy and meet compliance requirements (US/Canada).
- **Consequences**:
    - **Pros**: Data is secure even if DB is compromised.
    - **Cons**: Performance overhead, inability to search/index encrypted fields easily.
    - **Mitigation**: Use deterministic encryption or blind indexing if search is required (currently not implemented for encrypted fields).

## 6. Multi-Tenancy: Hybrid Approach
- **Decision**: Enforce `tenant_id` on every table and use Row-Level Security (RLS) or Service-Level filtering.
- **Context**: We are a B2B SaaS serving multiple landlord organizations.
- **Consequences**:
    - **Pros**: Strong isolation.
    - **Cons**: Developer discipline required to include `tenant_id` in every query.
