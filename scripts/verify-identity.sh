#!/bin/bash

# Base URL
BASE_URL="http://localhost:3001"

# Register a new user
EMAIL="test$(date +%s)@example.com"
echo "Registering new user with email: $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"phone\": \"1234567890\"
  }")

echo "Register Response: $REGISTER_RESPONSE"

# Extract token (assuming simple JSON response with access_token)
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Registration failed or no token returned."
  exit 1
fi

echo "Token: $TOKEN"

# Login with correct credentials
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\"
  }")

echo "Login Response: $LOGIN_RESPONSE"

# Login with incorrect credentials
echo "Logging in with wrong password..."
WRONG_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"wrongpassword\"
  }")

echo "Wrong Login Response: $WRONG_LOGIN_RESPONSE"

# Get User Profile to get ID
echo "Getting User Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"

# Verify PII is returned (decrypted)
FIRST_NAME=$(echo $PROFILE_RESPONSE | grep -o '"firstName":"[^"]*' | cut -d'"' -f4)
LAST_NAME=$(echo $PROFILE_RESPONSE | grep -o '"lastName":"[^"]*' | cut -d'"' -f4)

if [ "$FIRST_NAME" != "Test" ] || [ "$LAST_NAME" != "User" ]; then
  echo "PII Decryption Failed! Expected Test/User, got $FIRST_NAME/$LAST_NAME"
  exit 1
fi
echo "PII Decryption Verified: $FIRST_NAME $LAST_NAME"

USER_ID=$(echo $PROFILE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "User ID: $USER_ID"

if [ -z "$USER_ID" ]; then
  echo "Failed to get User ID"
  exit 1
fi

# Add Membership (Random Tenant/Role - expect failure or success depending on validation)
# Since we don't validate Tenant existence in Identity Service (yet), this might succeed if Role exists.
# But Role ID is FK. We need a valid Role ID.
# For now, let's try with a random UUID and expect 500 (FK violation) which proves endpoint is hit.
RANDOM_TENANT_ID="123e4567-e89b-12d3-a456-426614174000"
RANDOM_ROLE_ID="123e4567-e89b-12d3-a456-426614174001"

echo "Adding Membership..."
MEMBERSHIP_RESPONSE=$(curl -s -X POST "$BASE_URL/users/$USER_ID/tenants" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$RANDOM_TENANT_ID\",
    \"roleId\": \"$RANDOM_ROLE_ID\"
  }")

echo "Membership Response: $MEMBERSHIP_RESPONSE"

# List Memberships
echo "Listing Memberships..."
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID/tenants" \
  -H "Authorization: Bearer $TOKEN")

echo "List Response: $LIST_RESPONSE"
