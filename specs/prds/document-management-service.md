# PRD: Document Management Service

## 1. Overview
The Document Management Service is a centralized repository for all files in the system. It handles secure storage, retrieval, and organization of documents like Leases, IDs, Insurance Policies, and Inspection Reports.

## 2. User Stories

### Storage
- **As a Landlord**, I want to upload a signed PDF lease and attach it to the Lease record.
- **As a Tenant**, I want to upload a photo of my ID for verification.
- **As a System**, I want to store these files securely in the cloud (S3) and generate temporary access links.

### Organization
- **As a Landlord**, I want to tag documents by type (e.g., "Insurance", "Contract") for easy filtering.

## 3. Functional Requirements

### 3.1 Secure Storage
- Use Object Storage (AWS S3, Cloudflare R2).
- Buckets should be private. Access only via Signed URLs.

### 3.2 Metadata
- Store metadata (uploader, type, size, MIME type) in the database.
- Link documents to entities (Property, Unit, Lease, Person).

### 3.3 Virus Scanning
- (Future) Trigger a scan upon upload before marking the file as "Safe".

## 4. Data Model

### Document
- `id` (UUID, PK)
- `tenant_id` (FK)
- `entity_type` (Lease, Property, Person)
- `entity_id` (UUID)
- `document_type` (Lease Agreement, ID, Insurance, Photo)
- `file_name`
- `storage_key` (S3 Key)
- `mime_type`
- `size_bytes`
- `uploaded_by` (User ID)

## 5. API Endpoints

- `POST /documents/presigned-url`: Request a URL to upload a file directly to S3.
- `POST /documents`: Register the file metadata after upload.
- `GET /documents/:id/download`: Get a temporary read-only URL.
- `GET /documents`: List documents (filter by entity).

## 6. Integration Points
- **All Services**: Any service needing file storage (Property, Ticketing) delegates to this service.
