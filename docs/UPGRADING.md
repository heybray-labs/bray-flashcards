# Upgrading

## How schema changes apply

On every server start (and in `npm run db:init`), pending SQL migrations from `drizzle/`
run via `@heybray/server-kit`'s migration runner, then idempotent seeding runs. Production
Docker uses the same path — you do not run migrations manually unless developing locally.

## Local development workflow

After pulling schema changes:

```bash
npm install
npm run db:init    # migrate + seed
npm run dev
```

### Authoring a new migration

1. Edit schema under `server/schema/` and platform re-exports in
   `server/drizzle-packages-schema.ts`
2. `npm run db:generate` — review generated SQL in `drizzle/`
3. Never edit migrations already on `main` — append only (`bin/guards.sh` enforces this)
4. Test with `npm run db:init` on a fresh DB, then `npm test`

There is **no** `npm run db:migrate` script — use `db:init` or restart the server.

## Platform package updates

Generic platform code lives in published `@heybray/*` packages from
`heybray-labs/bray-platform`. A platform fix arrives here as a **version-bump PR** — update
pins in `package.json`, run `npm install`, restart. No source edit in this repo unless the
app wires new APIs.

Feature package updates (`@heybray/flashcards-*`) follow the same pin-bump pattern after
their npm publish (see `docs/RELEASING.md`).

## What this repo does **not** ship

- **No** `upgrade-backup.sh` / `upgrade-verify.sh`
- **No** quickstart/GHCR upgrade path (see `docs/DOCKER.md`)
- **No** tag-based release of the root app

For production backups before upgrading a deployment you operate yourself, use standard
Postgres tools (`pg_dump`) against the `flashcards` database on port **5441**.
