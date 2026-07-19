# Docker

## Default ports

| Service | Host port | Container |
|---------|-----------|-----------|
| API | **3102** | 3102 |
| Vite (dev only) | **5175** | — |
| Postgres (dev) | **5441** | 5432 |
| Postgres (test) | **5435** | 5432 |

Database name: **`flashcards`** (dev), **`flashcards_test`** (test).

## Development with Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Services:

- **`db`** — Postgres 16 (`postgres:16-alpine`), persistent volume `pgdata`
- **`app`** — multi-stage build from this repo's `Dockerfile`; runs migrations on start,
  then `tsx server/index.ts`

The app container expects `DATABASE_URL` pointing at the `db` service
(`postgresql://postgres:postgres@db:5432/flashcards`).

For day-to-day development on the host (Vite HMR), use `npm run dev` instead — it starts
only the database container and runs server + client locally (see `bin/dev.sh`).

## What this repo does **not** ship

- **No quickstart script** or `.env.docker.example`
- **No `docker:*` npm scripts** (demo helpers use `db:docker:*` for seed/wipe only)
- **No published container image** — CI runs `docker build` as a smoke test only
  (`push: false`); nothing is pushed to GHCR

## Demo data in Docker

```bash
npm run db:docker:demo-seed   # seed via one-off compose run
npm run db:docker:demo-wipe   # remove demo data only
npm run db:docker:wipe        # tear down compose volumes (destroys DB)
```

## Test database

API tests use `docker-compose.test.yml` (Postgres on port **5435**, ephemeral tmpfs).
Started automatically by `npm test` / `bin/test.sh` unless `SKIP_TEST_DOCKER=1` or running
in CI with a service container.
