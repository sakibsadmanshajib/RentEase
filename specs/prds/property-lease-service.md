# PRD: Property & Lease Service

## 1. Overview
The Property & Lease Service is the core operational domain of RentEase. It manages the physical assets (Properties, Units) and the legal contracts (Leases) that bind tenants to them. It also tracks the people (Occupants) living in the units.

## 2. User Stories

### Property Management
- **As a Landlord**, I want to add a property with its address and details.
- **As a Landlord**, I want to define units within a property (e.g., "Apt 101", "Suite B") with their specific attributes (beds, baths, sqft).
- **As a Landlord**, I want to track the status of units (Vacant, Occupied, Maintenance).

### Lease Management
- **As a Landlord**, I want to draft a new lease for a unit.
- **As a Landlord**, I want to specify rent, security deposits, and advance rent (e.g., Last Month's Rent for Ontario).
- **As a Landlord**, I want to include add-ons like parking or utilities in the lease.
- **As a Landlord**, I want to activate a lease once signed.
- **As a System**, I want to automatically mark leases as "Expired" when their end date passes.

### Occupant Management
- **As a Landlord**, I want to add occupants to a lease, distinguishing between the primary leaseholder and other residents.

## 3. Functional Requirements

### 3.1 Property & Unit CRUD
- Hierarchical structure: Tenant -> Property -> Unit.
- Support for single-family homes (1 unit) and multi-unit buildings.

### 3.2 Lease Lifecycle
- **Draft**: Created but not active.
- **Active**: Current valid lease.
- **Terminated**: Ended early.
- **Expired**: Reached end date naturally.

### 3.3 Lease Financials
- **Monthly Rent**: Base amount.
- **Currency**: USD or CAD.
- **Deposits**: Security Deposit, Pet Deposit.
- **Advance Rent**: Prepaid rent (e.g., Last Month).
- **Services**: Parking, Utilities (Water, Gas, Hydro, Internet).

## 4. Data Model

### Property
- `id` (UUID, PK)
- `tenant_id` (FK)
- `name`
- `address_line1`, `city`, `state`, `zip`
- `emergency_phone`
- `notes`

### Unit
- `id` (UUID, PK)
- `property_id` (FK)
- `unit_number`
- `bedrooms`, `bathrooms`, `floor`, `square_feet`
- `status` (Vacant, Occupied, Maintenance)

### Lease
- `id` (UUID, PK)
- `unit_id` (FK)
- `primary_tenant_id` (FK to Person)
- `start_date`, `end_date`
- `monthly_rent`
- `currency`
- `security_deposit_amount`
- `advance_rent_amount`
- `includes_parking`, `parking_spot_id`, `parking_fee`
- `utilities_included` (JSON array)
- `status` (Draft, Active, Terminated, Expired)

### Person (Occupant)
- `id` (UUID, PK)
- `first_name`, `last_name`
- `email`, `phone`
- `role` (Leaseholder, Occupant, Guarantor)

## 5. API Endpoints

### Properties & Units
- `POST /properties`: Create property.
- `POST /properties/:id/units`: Add unit.
- `GET /properties`: List properties.

### Leases
- `POST /leases`: Draft a lease.
- `PATCH /leases/:id/activate`: Activate a lease.
- `GET /leases/:id`: Get lease details.
- `GET /units/:id/leases`: History of leases for a unit.

## 6. Integration Points
- **Billing Service**: When a lease is activated, notify Billing to generate the recurring invoice schedule.
- **Identity Service**: Link Occupants to User accounts for Portal access.
