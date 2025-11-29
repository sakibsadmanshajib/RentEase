# PRD: Audit & Compliance Service

## 1. Overview
The Audit & Compliance Service ensures that RentEase meets strict security and privacy standards (SOC2, GDPR/CCPA concepts). It maintains an immutable log of all critical system actions, especially those involving PII (Personally Identifiable Information) and financial data.

## 2. User Stories

### Auditing
- **As a Compliance Officer**, I want to see a log of every time a user's PII was accessed.
- **As a Landlord**, I want to see who changed a lease setting and when.
- **As a System**, I want to record every login attempt (success/failure) for security monitoring.

### Data Privacy
- **As a Tenant**, I want to request a copy of all my data (Data Portability).
- **As a Tenant**, I want to request deletion of my data (Right to be Forgotten), subject to legal retention periods.

## 3. Functional Requirements

### 3.1 Immutable Logs
- Append-only storage (Write Once, Read Many).
- No API to delete or modify audit logs.

### 3.2 Event Types
- `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_FAILED`
- `PII_ACCESS`, `PII_MODIFICATION`
- `FINANCIAL_TRANSACTION`
- `SETTINGS_CHANGE`

### 3.3 Retention
- Configurable retention policies (e.g., Keep financial logs for 7 years, access logs for 1 year).

## 4. Data Model

### AuditEvent
- `id` (UUID, PK)
- `tenant_id` (FK)
- `actor_user_id` (FK)
- `event_type`
- `entity_type` (e.g., "Lease")
- `entity_id`
- `metadata` (JSON - e.g., "Changed rent from $1000 to $1100")
- `ip_address`
- `user_agent`
- `created_at`

## 5. API Endpoints

- `GET /audit-logs`: Query logs (Admin only).
- `POST /compliance/export`: Request data export.
- `POST /compliance/erasure`: Request data erasure.

## 6. Integration Points
- **All Services**: Every service pushes events to this service (via Message Queue) whenever a critical action occurs.
