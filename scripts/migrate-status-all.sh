#!/bin/bash

# Check migration status for all services
# Useful for local development

set -e

echo "📋 Checking migration status for all services..."
echo ""

# Identity Service
echo "📦 Identity Service:"
cd apps/identity-service
pnpm migrate:status
cd ../..
echo ""

# Tenant Service
echo "📦 Tenant Service:"
cd apps/tenant-service
pnpm migrate:status
cd ../..
echo ""

# Property Service
echo "📦 Property Service:"
cd apps/property-service
pnpm migrate:status
cd ../..
echo ""

# Billing Service
echo "📦 Billing Service:"
cd apps/billing-service
pnpm migrate:status
cd ../..
echo ""

echo "✅ Status check complete!"
