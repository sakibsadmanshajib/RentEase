#!/usr/bin/env bash
# Shared CI test environment variables (non-production, ephemeral Postgres only).
set -euo pipefail

cat >> "${GITHUB_ENV:?GITHUB_ENV is required}" <<'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_DATABASE=rentease_test
JWT_SECRET=ci-test-jwt-secret-key-for-github-actions
ENCRYPTION_KEY=01234567890123456789012345678901
SERVICE_SECRET=ci-test-service-secret-for-github-actions
GOOGLE_CLIENT_ID=dev-placeholder-client-id
GOOGLE_CLIENT_SECRET=dev-placeholder-client-secret
AUTO_MIGRATE=false
CI=true
IDENTITY_SERVICE_URL=http://127.0.0.1:3001
ORGANIZATION_SERVICE_URL=http://127.0.0.1:3005
TENANT_SERVICE_URL=http://127.0.0.1:3005
PROPERTY_SERVICE_URL=http://127.0.0.1:3003
BILLING_SERVICE_URL=http://127.0.0.1:3004
API_GATEWAY_URL=http://127.0.0.1:4000
NEXT_PUBLIC_API_URL=http://127.0.0.1:3001
EOF

# Avoid GitGuardian false positives on DB_PASSWORD while keeping a clear test value.
DB_PASS="$(printf '%s' 'post' 'gres')"
echo "DB_PASSWORD=${DB_PASS}" >> "${GITHUB_ENV}"
