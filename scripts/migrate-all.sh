#!/bin/bash

# Migrate all services at once
# Useful for local development

set -e

echo "🚀 Running migrations for all services..."
echo ""

# Identity Service
echo "📦 Identity Service..."
cd apps/identity-service
pnpm migrate
cd ../..
echo "✅ Identity Service migrations complete"
echo ""

# Tenant Service
echo "📦 Tenant Service..."
cd apps/tenant-service
pnpm migrate
cd ../..
echo "✅ Tenant Service migrations complete"
echo ""

# Property Service
echo "📦 Property Service..."
cd apps/property-service
pnpm migrate
cd ../..
echo "✅ Property Service migrations complete"
echo ""

# Billing Service
echo "📦 Billing Service..."
cd apps/billing-service
pnpm migrate
cd ../..
echo "✅ Billing Service migrations complete"
echo ""

echo "🎉 All migrations completed successfully!"
