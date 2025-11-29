# PRD: Messaging Service

## 1. Overview
The Messaging Service handles direct, private communication between users (e.g., Landlord <-> Tenant) that is *not* related to a specific maintenance ticket. It functions like a direct message (DM) system or email-style thread.

## 2. User Stories

### Direct Messaging
- **As a Tenant**, I want to send a message to my Landlord about a general inquiry (e.g., "Renewing Lease").
- **As a Landlord**, I want to see an inbox of messages from all my tenants.
- **As a User**, I want to see a typing indicator when the other person is writing.

### Organization
- **As a System**, I want to keep these messages separate from maintenance tickets to avoid clutter.

## 3. Functional Requirements

### 3.1 Threads
- Messages are organized into Threads (Subject + Participants).
- A thread can have 2 or more participants (Group DMs).

### 3.2 Real-time
- Use WebSockets (or polling for MVP) for instant delivery.
- Typing indicators.
- Read receipts (optional for MVP).

## 4. Data Model

### MessageThread
- `id` (UUID, PK)
- `tenant_id` (FK)
- `subject`
- `last_message_at`

### ThreadParticipant
- `thread_id` (FK)
- `user_id` (FK)

### Message
- `id` (UUID, PK)
- `thread_id` (FK)
- `sender_id` (FK)
- `body`
- `created_at`

## 5. API Endpoints

- `POST /threads`: Start a new conversation.
- `GET /threads`: List inbox.
- `GET /threads/:id/messages`: Get message history.
- `POST /threads/:id/messages`: Send reply.

## 6. Integration Points
- **Identity Service**: Resolve user names/avatars for the inbox UI.
