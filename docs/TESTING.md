# Testing

## Quick start

```bash
npm test
```

Runs `bin/test.sh`, which:

1. Starts test Postgres on **`localhost:5435`** (`docker-compose.test.yml`, database
   **`flashcards_test`**) unless `CI` or `SKIP_TEST_DOCKER=1`
2. Runs **`./bin/guards.sh`**
3. Runs **`npm run test:api`** — server API smoke tests (`vitest.config.ts`)
4. Runs **`npm run test --workspace=packages/flashcards-client`** — client package unit
   tests (happy-dom)

Use `./bin/test.sh --keep-db` to leave the test container running between iterations.

## Server API tests

| File | Module |
|------|--------|
| `server/test/api/auth.test.ts` | Auth |
| `server/test/api/classifications.test.ts` | Taxonomy |
| `server/test/api/decks.test.ts` | Decks CRUD |
| `server/test/api/health.test.ts` | Health |
| `server/test/api/media-teams.test.ts` | Media + teams/star-map |
| `server/test/api/points.test.ts` | Gamification |
| `server/test/api/sessions.test.ts` | Study sessions |

Vitest config: `vitest.config.ts` — Node environment, `fileParallelism: false`, global
setup applies migrations to a fresh DB.

Test env defaults (`server/test/env.ts`, `bin/test.sh`): `AUTH_PROTOCOL=local`,
`JWT_SECRET=test-jwt-secret`, `APP_URL=http://localhost:5175`, elevated rate limits for
test throughput.

## Client package tests

`packages/flashcards-client` runs Vitest with **happy-dom** (`src/**/*.test.tsx`). This
step has no equivalent in `bray-scenarios`' root test script — it validates exported React
components from the feature package.

## CI

`.github/workflows/ci.yml`: **`guards`** → **`verify`** (typecheck + build) → **`migrate`**
(fresh DB + `db:init`) → **`api-tests`** → **`docker-build`** (smoke, no push).

Required merge checks: **`guards / guards`**, **`verify`**.

## Definition of green

`npm run typecheck`, `npm run build`, `npm test`, and `docker build` all pass.
