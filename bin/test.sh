#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KEEP_DB=false
for arg in "$@"; do
  case "$arg" in
    --keep-db) KEEP_DB=true ;;
  esac
done

TEST_DATABASE_URL="${TEST_DATABASE_URL:-postgresql://postgres:postgres@localhost:5435/flashcards_test}"

cleanup() {
  if [[ "$KEEP_DB" == "false" ]]; then
    docker compose -f docker-compose.test.yml down -v --remove-orphans 2>/dev/null || true
  fi
}
trap cleanup EXIT

if [[ -z "${CI:-}" && -z "${SKIP_TEST_DOCKER:-}" ]]; then
  echo "Starting test Postgres on :5435..."
  docker compose -f docker-compose.test.yml up -d --wait
fi

export DATABASE_URL="$TEST_DATABASE_URL"
export NODE_ENV=test
export JWT_SECRET=test-jwt-secret
export AUTH_PROTOCOL=local
export APP_URL=http://localhost:5175
export RATE_LIMIT_MAX=10000
export AUTH_RATE_LIMIT_MAX=10000
export MEDIA_DIR="${MEDIA_DIR:-/tmp/bray-flashcards-test-media}"

echo "Checking for committed yalc links..."
./bin/check-no-yalc.sh

echo "Running API tests..."
npm run test:api

echo "Running client smoke tests..."
npm run test --workspace=packages/flashcards-client
