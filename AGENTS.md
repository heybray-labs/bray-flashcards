# Agent Guide — bray-flashcards

Phase 5 validation app: a flashcard/quiz trainer proving the published `@heybray/*`
platform packages compose into a second real app.

**For any work touching `bray-platform` or another app repo, `docs/DEVELOPMENT.md` in
this repo is required reading and its "Standing rules" apply by default** — yalc-first
cross-repo iteration, never auto-merge a Version Packages/publish PR, and the
CI-round-trip discipline (iterate locally, batch small fixes, don't idle-wait on CI).
These are permanent defaults, not per-task instructions. (Canonical source:
`bray-scenarios/docs/DEVELOPMENT.md` — keep in sync.)

## What this repo is

Single-package app (NOT Scenarios' client/server workspaces):

- `server/` — Express API via `tsx` (no build step); explicit `.ts` import extensions
- `src/` — React 18 + Vite client; built to `dist/` for production
- `drizzle/` — hand-authored or generated SQL migrations + journal
- `@heybray/*` — published platform packages from npm (never patch locally)

**No `@heybray/llm`.** Local auth only (no SSO/2FA in this phase).

## Non-obvious conventions

1. **Server has NO build step** — runs raw TypeScript via `tsx`.
2. **ESM everywhere** (`"type": "module"`).
3. **Platform gaps go through `bray-platform`** — PR + changeset + manual npm publish.
   Never vendor or patch `@heybray/*` inside this repo.
4. **Migrations** — app's `drizzle/` owns platform + app tables (packages don't ship
   migrations yet). Binding FKs are a separate hand-authored migration after `0000`.
## Commands

| Purpose | Command |
|---|---|
| Typecheck | `npm run typecheck` |
| Client build | `npm run build` |
| Dev (both) | `npm run dev` |
| DB init | `npm run db:init` (needs `DATABASE_URL`) |
| Generate migration | `npm run db:generate` |
| API tests | `npm test` (after Step 5) |

## Definition of green

`npm run typecheck`, `npm run build`, `npm test`, `docker build` all pass.
