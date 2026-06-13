#!/usr/bin/env bash
set -euo pipefail

URL="${1:?Usage: wait-for-http.sh <url> [timeout_seconds]}"
TIMEOUT="${2:-90}"

log() { echo "[wait-for-http] $*"; }

for ((i = 1; i <= TIMEOUT; i++)); do
  if curl -sf --max-time 2 "$URL" > /dev/null; then
    log "$URL is ready (${i}s)"
    exit 0
  fi
  sleep 1
done

log "ERROR: $URL did not become ready within ${TIMEOUT}s"
exit 1
