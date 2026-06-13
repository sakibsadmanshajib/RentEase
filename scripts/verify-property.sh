#!/bin/bash

BASE_URL="http://localhost:3003"
TENANT_SERVICE_URL="http://localhost:3005"

# 1. Create Property
echo "Creating Property..."
PROPERTY_NAME="Sunset Apartments $(date +%s)"
TENANT_ID="26acea42-2c57-48f7-8b17-ac963b6a3779" # Using the one from Tenant Service verification if available, or just a UUID

PROPERTY_RESPONSE=$(curl -s -X POST "$BASE_URL/properties" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROPERTY_NAME\",
    \"address\": \"123 Sunset Blvd\",
    \"tenantId\": \"$TENANT_ID\"
  }")

echo "Property Response: $PROPERTY_RESPONSE"
PROPERTY_ID=$(echo $PROPERTY_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Property ID: $PROPERTY_ID"

if [ -z "$PROPERTY_ID" ]; then
  echo "Failed to create property"
  exit 1
fi

# 2. Create Unit
echo "Creating Unit..."
UNIT_NAME="Apt 101"
UNIT_RESPONSE=$(curl -s -X POST "$BASE_URL/units" \
  -H "Content-Type: application/json" \
  -d "{
    \"propertyId\": \"$PROPERTY_ID\",
    \"name\": \"$UNIT_NAME\"
  }")

echo "Unit Response: $UNIT_RESPONSE"
UNIT_ID=$(echo $UNIT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Unit ID: $UNIT_ID"

if [ -z "$UNIT_ID" ]; then
  echo "Failed to create unit"
  exit 1
fi

# 3. Create Lease (Draft)
echo "Creating Lease..."
LEASE_RESPONSE=$(curl -s -X POST "$BASE_URL/leases" \
  -H "Content-Type: application/json" \
  -d "{
    \"unitId\": \"$UNIT_ID\",
    \"startDate\": \"2025-01-01\",
    \"endDate\": \"2026-01-01\",
    \"rentAmount\": 1500,
    \"tenantId\": \"$TENANT_ID\"
  }")

echo "Lease Response: $LEASE_RESPONSE"
LEASE_ID=$(echo $LEASE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Lease ID: $LEASE_ID"

if [ -z "$LEASE_ID" ]; then
  echo "Failed to create lease"
  exit 1
fi

# 4. Add Occupant
echo "Adding Occupant..."
USER_ID="8e086511-5348-43cd-85fe-7ebf94c863a3" # Mock User ID
OCCUPANT_RESPONSE=$(curl -s -X POST "$BASE_URL/leases/$LEASE_ID/occupants" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\"
  }")

echo "Occupant Response: $OCCUPANT_RESPONSE"

# 5. Activate Lease
echo "Activating Lease..."
ACTIVATE_RESPONSE=$(curl -s -X POST "$BASE_URL/leases/$LEASE_ID/activate")
echo "Activate Response: $ACTIVATE_RESPONSE"

# 6. Verify Unit Status (Should be OCCUPIED)
echo "Verifying Unit Status..."
UNIT_CHECK=$(curl -s -X GET "$BASE_URL/units/$UNIT_ID")
echo "Unit Check: $UNIT_CHECK"
STATUS=$(echo $UNIT_CHECK | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$STATUS" != "OCCUPIED" ]; then
  echo "Unit status check failed! Expected OCCUPIED, got $STATUS"
  exit 1
fi
echo "Unit Status Verified: $STATUS"
