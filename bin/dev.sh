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

export MEDIA_DIR="${MEDIA_DIR:-data/media}"
export VITE_API_PORT="${VITE_API_PORT:-${PORT:-3102}}"

./bin/yalc-cache-bust.sh
./bin/check-dev-db-port.sh
docker compose up -d db --wait
npm run db:init

exec concurrently -n server,client -c blue,green \
  "npm run dev:server" \
  "npm run dev:client"
