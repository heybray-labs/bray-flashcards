#!/usr/bin/env bash
# Run a server demo script in a one-off app container on the Compose network.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SCRIPT=${1:?usage: demo-docker-run.sh server/demo-seed.ts}
shift || true

if ! docker compose ps --services --filter status=running 2>/dev/null | grep -qx db; then
  echo "error: db container is not running. Start with: docker compose up -d db" >&2
  exit 1
fi

MOUNTS=(-v "$ROOT/server:/app/server")
FLASHCARDS_SERVER_SRC="$ROOT/packages/flashcards-server/src"
if [[ -d "$FLASHCARDS_SERVER_SRC" ]]; then
  MOUNTS+=(-v "$FLASHCARDS_SERVER_SRC:/app/node_modules/@heybray/flashcards-server/src")
fi

# Local dev reads ./data/media on the host; bind-mount so docker demo-seed matches.
mkdir -p "$ROOT/data/media"
MOUNTS+=(-v "$ROOT/data/media:/app/data/media")

# Demo seed generates Lucide PNG covers; ensure deps exist in the one-off container
# without requiring a full image rebuild after package.json changes.
SETUP="npm install --no-save sharp lucide && "

exec docker compose run --rm --no-deps \
  --entrypoint sh \
  "${MOUNTS[@]}" \
  app -c "${SETUP}npx tsx ${SCRIPT}"
