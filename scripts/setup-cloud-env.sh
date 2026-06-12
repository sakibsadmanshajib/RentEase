#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() { echo "[setup-cloud-env] $*"; }

# --- Node 24 via nvm ---
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
  nvm install 24 2>/dev/null || true
  nvm use 24
elif [ -s "/root/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "/root/.nvm/nvm.sh"
  nvm use 24
fi

log "Node version: $(node -v)"
corepack enable 2>/dev/null || true

# --- Dependencies ---
log "Installing dependencies..."
pnpm install --frozen-lockfile

log "Building shared packages..."
pnpm --filter @rentease/common build
pnpm --filter @rentease/auth build

# --- PostgreSQL ---
log "Ensuring PostgreSQL is running..."
if command -v pg_isready >/dev/null 2>&1; then
  sudo service postgresql start 2>/dev/null || true
  for i in $(seq 1 30); do
    if pg_isready -h localhost -q 2>/dev/null; then
      break
    fi
    sleep 1
  done
  if ! pg_isready -h localhost -q 2>/dev/null; then
    log "WARNING: PostgreSQL is not ready; migrations may fail."
  else
    log "PostgreSQL is ready."
    sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='rentease'" | grep -q 1 \
      || sudo -u postgres createdb rentease
  fi
else
  log "WARNING: pg_isready not found; skipping database setup."
fi

# --- Shared dev secrets (honor Cursor Secrets if set) ---
generate_secret() {
  openssl rand -hex 32
}

JWT_SECRET="${JWT_SECRET:-$(generate_secret)}"
SERVICE_SECRET="${SERVICE_SECRET:-$(generate_secret)}"

if [ -n "${ENCRYPTION_KEY:-}" ]; then
  if [ "${#ENCRYPTION_KEY}" -ne 32 ]; then
    log "ERROR: ENCRYPTION_KEY must be exactly 32 characters."
    exit 1
  fi
else
  ENCRYPTION_KEY="$(openssl rand -hex 16)"
fi

write_env_if_missing() {
  local target="$1"
  local content="$2"
  if [ -f "$target" ]; then
    log "Keeping existing $target"
  else
    echo "$content" > "$target"
    log "Created $target"
  fi
}

# --- Backend .env files ---
write_env_if_missing "apps/identity-service/.env" "$(cat <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=rentease
DB_USERNAME=postgres
DB_PASSWORD=password
JWT_SECRET=${JWT_SECRET}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
ENCRYPTION_KEY=${ENCRYPTION_KEY}
SERVICE_SECRET=${SERVICE_SECRET}
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
EOF
)"

write_env_if_missing "apps/organization-service/.env" "$(cat <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=rentease
DB_USERNAME=postgres
DB_PASSWORD=password
JWT_SECRET=${JWT_SECRET}
SERVICE_SECRET=${SERVICE_SECRET}
AUTO_MIGRATE=true
EOF
)"

write_env_if_missing "apps/property-service/.env" "$(cat <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=rentease
DB_USERNAME=postgres
DB_PASSWORD=password
JWT_SECRET=${JWT_SECRET}
EOF
)"

write_env_if_missing "apps/billing-service/.env" "$(cat <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=rentease
DB_USERNAME=postgres
DB_PASSWORD=password
JWT_SECRET=${JWT_SECRET}
AUTO_MIGRATE=true
EOF
)"

write_env_if_missing "apps/web/.env.local" "$(cat <<EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
)"

# --- Migrations ---
log "Running database migrations..."
pnpm --filter identity-service migrate
pnpm --filter @rentease/organization-service migrate
pnpm --filter property-service migrate
pnpm --filter billing-service migrate

log "Setup complete."
log "  Node:       $(node -v)"
log "  PostgreSQL: $(pg_isready -h localhost 2>/dev/null && echo 'ready' || echo 'not available')"
log "  Start all:  pnpm turbo dev"
log "  Unit tests: pnpm test:unit"
