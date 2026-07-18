#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

INSTALL_MARKER=".npm-install.stamp"
if [ ! -d node_modules ] || [ ! -f "$INSTALL_MARKER" ] || [ package-lock.json -nt "$INSTALL_MARKER" ]; then
  npm install
  touch "$INSTALL_MARKER"
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — update JWT_SECRET if needed."
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

docker compose up -d db --wait
npm run db:init

exec concurrently -n server,client -c blue,green \
  "npm run dev:server" \
  "npm run dev:client"
