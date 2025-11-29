# PRD: Payments Integration Service

## 1. Overview
The Payments Integration Service acts as a secure gateway between RentEase and external payment providers (Stripe, Plaid/ACH, etc.). It handles the complexity of PCI compliance by dealing only with tokens and webhooks, keeping sensitive card data out of our core systems.

## 2. User Stories

### Payment Processing
- **As a Tenant**, I want to save a payment method (Card/Bank Account) securely.
- **As a Tenant**, I want to pay my rent using a saved method.
- **As a Landlord**, I want to receive payouts to my bank account.

### System Reliability
- **As a System**, I want to handle payment webhooks (Success/Failure) reliably to update invoice statuses.
- **As a System**, I want to prevent duplicate charges (Idempotency).

## 3. Functional Requirements

### 3.1 Tokenization
- Integrate with Stripe Elements / Plaid Link on the frontend.
- Backend receives and stores only the `payment_method_id` (Token), never the raw card number.

### 3.2 Payment Intents
- Create Payment Intents for specific amounts.
- Confirm payments server-side.

### 3.3 Webhook Handling
- Listen for provider events (`payment_intent.succeeded`, `charge.failed`).
- Verify webhook signatures.
- Translate provider events into internal domain events (`PaymentSuccess`, `PaymentFailed`).

### 3.4 Idempotency
- Use unique keys for every charge request to prevent double-billing on network retries.

## 4. Data Model

### PaymentMethod
- `id` (UUID, PK)
- `tenant_person_id` (FK)
- `provider` (Stripe)
- `provider_token_id`
- `last4`
- `card_brand`
- `is_default`

### PaymentTransaction
- `id` (UUID, PK)
- `external_id` (Stripe Charge ID)
- `amount`, `currency`
- `status` (Pending, Succeeded, Failed)
- `raw_response` (JSON - for debugging)

## 5. API Endpoints

- `POST /payment-methods`: Save a new token.
- `GET /payment-methods`: List saved methods.
- `POST /charges`: Initiate a charge.
- `POST /webhooks/stripe`: Webhook receiver.

## 6. Integration Points
- **Billing Service**: The Billing Service calls this service to execute a charge. This service calls back (or emits an event) when the charge succeeds, prompting the Billing Service to record the Ledger Entry.
