#!/usr/bin/env bash
# Stop dev Compose stack and delete all volumes (Postgres data, media, SAML certs).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

docker compose down -v --remove-orphans

if [[ -d "$ROOT/data/media" ]]; then
  rm -rf "$ROOT/data/media"
  echo "Removed host data/media"
fi

echo ""
echo "Docker dev data wiped (pgdata, media_data, saml_certs)."
echo "Start fresh with: docker compose up -d db && npm run db:init && npm run db:docker:demo-seed"
