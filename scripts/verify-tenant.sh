#!/bin/bash

BASE_URL="http://localhost:3005"
IDENTITY_URL="http://localhost:3001"

# 1. Register a user in Identity Service to get a token
echo "Registering User..."
EMAIL="tenant_admin_$(date +%s)@example.com"
PASSWORD="password123"

REGISTER_RESPONSE=$(curl -s -X POST "$IDENTITY_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Tenant\",
    \"lastName\": \"Admin\",
    \"phone\": \"1234567890\"
  }")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

# 2. Create Tenant
echo "Creating Tenant..."
TENANT_NAME="Test Tenant $(date +%s)"
TENANT_SLUG="test-tenant-$(date +%s)"

TENANT_RESPONSE=$(curl -s -X POST "$BASE_URL/tenants" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TENANT_NAME\",
    \"slug\": \"$TENANT_SLUG\",
    \"contactEmail\": \"$EMAIL\"
  }")

echo "Tenant Response: $TENANT_RESPONSE"
TENANT_ID=$(echo $TENANT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Tenant ID: $TENANT_ID"

if [ -z "$TENANT_ID" ]; then
  echo "Failed to create tenant"
  exit 1
fi

# 3. Suspend Tenant
echo "Suspending Tenant..."
SUSPEND_RESPONSE=$(curl -s -X POST "$BASE_URL/tenants/$TENANT_ID/suspend")
echo "Suspend Response: $SUSPEND_RESPONSE"

# 4. Activate Tenant
echo "Activating Tenant..."
ACTIVATE_RESPONSE=$(curl -s -X POST "$BASE_URL/tenants/$TENANT_ID/activate")
echo "Activate Response: $ACTIVATE_RESPONSE"

# 5. Create Invitation
echo "Creating Invitation..."
INVITE_EMAIL="staff_$(date +%s)@example.com"
ROLE_ID="123e4567-e89b-12d3-a456-426614174001" # Mock Role ID

INVITE_RESPONSE=$(curl -s -X POST "$BASE_URL/tenants/$TENANT_ID/invitations" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$INVITE_EMAIL\",
    \"roleId\": \"$ROLE_ID\"
  }")

echo "Invite Response: $INVITE_RESPONSE"
INVITE_TOKEN=$(echo $INVITE_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Invite Token: $INVITE_TOKEN"

if [ -z "$INVITE_TOKEN" ]; then
  echo "Failed to create invitation"
  exit 1
fi

# 6. Accept Invitation (using the same user token for simplicity, though usually it's a different user)
echo "Accepting Invitation..."
ACCEPT_RESPONSE=$(curl -s -X POST "$BASE_URL/tenants/invitations/$INVITE_TOKEN/accept" \
  -H "Authorization: Bearer $TOKEN")

echo "Accept Response: $ACCEPT_RESPONSE"

# 7. Verify Membership in Identity Service
# We need to get the user ID first
USER_PROFILE=$(curl -s -X GET "$IDENTITY_URL/users/me" -H "Authorization: Bearer $TOKEN")
USER_ID=$(echo $USER_PROFILE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "Verifying Membership for User $USER_ID..."
MEMBERSHIP_RESPONSE=$(curl -s -X GET "$IDENTITY_URL/users/$USER_ID/tenants" \
  -H "Authorization: Bearer $TOKEN")

echo "Membership Response: $MEMBERSHIP_RESPONSE"
