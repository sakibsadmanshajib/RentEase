#!/usr/bin/env bash
set -euo pipefail

FILTER="${1:?Usage: start-backend-service.sh <pnpm-filter> <port>}"
PORT="${2:?Usage: start-backend-service.sh <pnpm-filter> <port>}"
LOG_FILE="${3:-service.log}"

log() { echo "[start-backend-service] $*"; }

log "Starting $FILTER on port $PORT..."
pnpm --filter "$FILTER" dev > "$LOG_FILE" 2>&1 &

bash "$(dirname "$0")/wait-for-http.sh" "http://127.0.0.1:${PORT}/api/docs" 90
