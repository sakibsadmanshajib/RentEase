#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:?Usage: start-test-stack.sh <service-name>}"

log() { echo "[start-test-stack] $*"; }

start_if_needed() {
  local filter="$1"
  local port="$2"
  local log_file="$3"

  if curl -sf --max-time 2 "http://127.0.0.1:${port}/api/docs" > /dev/null 2>&1; then
    log "${filter} already running on :${port}"
    return
  fi

  bash "$(dirname "$0")/start-backend-service.sh" "$filter" "$port" "$log_file"
}

# Most API suites authenticate via identity-service.
if [[ "$SERVICE" != "identity" ]]; then
  log "Running identity-service migrations for auth dependency..."
  pnpm --filter identity-service migrate || true
  start_if_needed "identity-service" 3001 "identity-dep.log"
fi

start_organization_if_needed() {
  log "Running organization-service migrations..."
  pnpm --filter "@rentease/organization-service" migrate || true
  start_if_needed "@rentease/organization-service" 3005 "organization.log"
}

case "$SERVICE" in
  identity)
    start_if_needed "identity-service" 3001 "identity.log"
    ;;
  organization)
    start_organization_if_needed
    ;;
  property)
    start_organization_if_needed
    start_if_needed "property-service" 3003 "property.log"
    ;;
  billing)
    start_organization_if_needed
    start_if_needed "billing-service" 3004 "billing.log"
    ;;
  *)
    log "Unknown service: $SERVICE"
    exit 1
    ;;
esac
