# Friction log — Phase 5 (`bray-flashcards`)

Maintained continuously during implementation. Every entry is categorized:

| Tag | Meaning | Action |
|---|---|---|
| **[platform-gap]** | Assumption in `@heybray/*` that doesn't generalize beyond Scenarios | → `bray-platform` PR + changeset |
| **[boilerplate]** | Repeated copy-paste from Scenarios/basic-app that a scaffold should own | → scaffold-candidate list for ADR |
| **[app-specific]** | Normal app-domain work; no platform or scaffold action | → note only |

---

## Entries

### FL-001 — Tailwind content globs for published packages
**Category:** [boilerplate]  
**Step:** 0  
**Detail:** `examples/basic-app` tailwind `content` still points at `../../packages/*/src/**` (monorepo layout). A standalone app consuming published npm packages must scan `node_modules/@heybray/{ui,react,gamification-react}/dist/**` instead.  
**Action:** Document in ADR scaffold checklist; basic-app pins stale in bray-platform (opportunistic fix per Step 7).

### FL-002 — drizzle.config schema path for published packages
**Category:** [boilerplate]  
**Step:** 0  
**Detail:** `basic-app` globs `../../packages/*/src/schema/**`; post-Phase-4 Scenarios uses `server/drizzle-packages-schema.ts` re-exporting from `@heybray/*/schema`. Flashcards follows the Scenarios pattern.  
**Action:** Scaffold template should ship `drizzle-packages-schema.ts` + comment explaining why.

### FL-003 — Single-package vs Scenarios split
**Category:** [app-specific]  
**Step:** 0  
**Detail:** Deliberate choice per Phase 5 brief: single `package.json` with `server/` + `src/` side by side (basic-app shape), not Scenarios' `client`/`server` workspaces.  
**Action:** Track boilerplate ratio through phase; record in ADR Step 8.

### FL-004 — Dev ports chosen to avoid collisions
**Category:** [app-specific]  
**Step:** 0  
**Detail:** API `:3102`, Vite `:5175` (Scenarios uses 3001/5173, basic-app uses 3101/5174).  
**Action:** None.

### FL-005 — `reward_tiers.legacy_id` in published gamification schema
**Category:** [platform-gap] (low)  
**Step:** 1  
**Detail:** `drizzle-kit generate` for 0000 emits `legacy_id integer` on `reward_tiers` because the column is still in `@heybray/gamification/schema`. Scenarios migration artifact; unused by App #2.  
**Action:** Remove from package schema when Scenarios ships 0010 drop migration; track in Step 7 if still present.

### FL-006 — Gamification/taxonomy tables default `content_type` to `'scenario'`
**Category:** [platform-gap] (low)  
**Step:** 1  
**Detail:** Generated 0000 sets `DEFAULT 'scenario'` on `reward_tiers`, `user_content_tier_awards`, and `content_classification_links`. App uses `deck` at runtime via config; defaults are misleading in a greenfield DB.  
**Action:** Platform schema should use a neutral default or no default; defer to Step 7 unless it causes bugs.

### FL-007 — Empty drizzle journal required before first `db:generate`
**Category:** [boilerplate]  
**Step:** 1  
**Detail:** Step 0 scaffold created `drizzle/meta/` but not `_journal.json`; first `drizzle-kit generate` failed with ENOENT until an empty journal was added manually.  
**Action:** Scaffold template should ship `drizzle/meta/_journal.json` with `"entries": []`.

### FL-008 — Chassis `server/app.ts` largely copied from Scenarios
**Category:** [boilerplate]  
**Step:** 1  
**Detail:** CORS/origin allowlist, tenant middleware, rate limiting, identity + taxonomy + gamification + media router mounting, static SPA fallback — near-verbatim from `bray-scenarios/server/app.ts` with route prefixes adjusted. No `createApp()` factory exists.  
**Action:** Count toward boilerplate ratio in Step 8 ADR; optional `createApp()` remains a non-goal per Phase 5 brief.

### FL-009 — `MediaUsageHook` implementation copied from Scenarios
**Category:** [boilerplate]  
**Step:** 2  
**Detail:** `server/media-usage.ts` mirrors `bray-scenarios/server/media-usage.ts` — `countUsages` + `onMediaDeleted` against `decks.coverImageMediaId`. Platform correctly delegates app-specific cover references to the hook.  
**Action:** Scaffold should ship a stub `media-usage.ts` with a comment pointing at the pattern.

### FL-010 — Classification seed module copied from Scenarios shape
**Category:** [boilerplate]  
**Step:** 2  
**Detail:** `server/seed-classifications.ts` follows Scenarios' `seed-classifications.ts` structure (dimension insert + option loop) but with a single `topic` dimension and four options.  
**Action:** Scaffold candidate; dimension/option data is app-specific.

### FL-011 — Deck↔topic links via `classificationService.setContentClassifications`
**Category:** [app-specific]  
**Step:** 2  
**Detail:** Deck create/update accepts `topic` slug in the body; routes call `classificationService.setContentClassifications("deck", id, { topic })`. Generic taxonomy write path works without platform changes.  
**Action:** None.

### FL-012 — No `GamificationService.setRewardTiers`; tier writes are app-owned
**Category:** [platform-gap] (low)  
**Step:** 3  
**Detail:** `GamificationService` exposes `getRewardTiers` but tier persistence uses direct `reward_tiers` inserts/updates with `normalizeRewardTiers` — same reconcile pattern as Scenarios' `roleplay-system.controller`. Brief's "tier get/set API" is really get-via-service + set-via-app-DB.  
**Action:** Optional platform helper in Step 7; not blocking.

### FL-013 — Reward-tier reconcile copied from Scenarios controller
**Category:** [boilerplate]  
**Step:** 3  
**Detail:** `server/lib/deck-gamification.ts` `replaceDeckRewardTiers` mirrors the upsert/delete loop from `roleplay-system.controller.ts` (~40 lines).  
**Action:** Scaffold candidate once a platform `setRewardTiers` helper exists (FL-012).

### FL-014 — Star map drawer hardcodes Scenarios-shaped API paths
**Category:** [platform-gap]  
**Step:** 4  
**Detail:** `MemberProgressDrawer` fetches `/scenario-history` and expects `categories[].scenarios`; `DeckListRow` must call `/roleplays/:id/attempts` for the expand list. Server implements those paths as deck adapters; URLs/prop names remain Scenarios literals.  
**Action:** Step 7: generalize team-star-map-react URLs to content-neutral names with back-compat aliases.

### FL-015 — Client shell files copied from Scenarios
**Category:** [boilerplate]  
**Step:** 4  
**Detail:** `AppLayout.tsx`, `admin-panels.ts`, `TeamStarMapPage.tsx` are near-verbatim from `bray-scenarios/client/` with permission strings, endpoints, and row component swapped. `HomePage` sidebar reuses gamification-react panels directly.  
**Action:** Count toward ADR boilerplate ratio.

### FL-016 — `StagePanel`/`FieldBlock` reused; `RESULT_STAGES` not used
**Category:** [app-specific]  
**Step:** 4  
**Detail:** Generic reveal primitives fit session results with custom step labels (deck / score / rewards). `RESULT_STAGES` copy is conversation-shaped and was correctly skipped.  
**Action:** None.

### FL-017 — Session results passed via `sessionStorage` (no GET endpoint)
**Category:** [app-specific]  
**Step:** 4  
**Detail:** Complete response is stashed client-side for the results page; no server route to re-fetch a completed session by id.  
**Action:** Optional GET `/api/decks/:deckId/sessions/:id` in a later step if deep-linking results matters.

### FL-018 — Test harness copied from Scenarios
**Category:** [boilerplate]  
**Step:** 5  
**Detail:** `docker-compose.test.yml`, `bin/test.sh`, `vitest.config.ts`, and `server/test/` helpers (`env.ts`, `global-setup.ts`, `setup.ts`, `db.ts`, `helpers/request.ts`, `helpers/auth.ts`, `helpers/assertions.ts`) are near-verbatim from `bray-scenarios` with port `5435`, `db:init` via `initializeDatabase()`, and deck-specific fixtures. API test files follow Scenarios' suite shape (auth, health, classifications, points, teams/star-map) adapted for decks/sessions.  
**Action:** Count toward ADR boilerplate ratio; candidate for shared test-kit package or scaffold template.

### FL-019 — Duplicate `setupAdmin` across test files within a suite
**Category:** [app-specific]  
**Step:** 5  
**Detail:** Each test file calls `setupAdmin()` in `beforeAll`; `resetMutableData()` truncates users between files so this works, but nested `describe` blocks in the same file must share one `beforeAll` (learned fixing `media-teams.test.ts`).  
**Action:** None — document pattern in harness if extracted to template.

### FL-020 — Dockerfile and CI copied from Scenarios, adapted to single-package
**Category:** [boilerplate]  
**Step:** 6  
**Detail:** 3-stage `Dockerfile`, `docker/entrypoint.sh`, and `.github/workflows/ci.yml` follow Scenarios' job shape (typecheck+build, fresh-DB init, API tests vs Postgres service, docker build smoke) with single-package paths (`npm run build`, `db:init`, port 3102, `dist/` + `server/` layout).  
**Action:** Count toward ADR boilerplate ratio.

---

## Step 7 — Platform round-trip

### FL-005 — `reward_tiers.legacy_id` (deferred)
**Category:** [platform-gap] (low)  
**Status:** **Deferred** — column remains in `@heybray/gamification/schema` until Scenarios ships migration 0010 drop. No platform PR in this round.

### FL-006 — `content_type DEFAULT 'scenario'`
**Category:** [platform-gap]  
**Status:** PR [heybray-labs/bray-platform#4](https://github.com/heybray-labs/bray-platform/pull/4) — changeset `phase5-gamification-gaps` removes defaults from `reward_tiers`, `user_content_tier_awards`, and `content_classification_links`.

### FL-012 — `GamificationService.setRewardTiers`
**Category:** [platform-gap]  
**Status:** Same PR — `setRewardTiers` + `ensureDefaultRewardTiers` added to `@heybray/gamification`. Flashcards can replace `deck-gamification.ts` reconcile after pin bump.

### FL-014 — Star map Scenarios-shaped API paths
**Category:** [platform-gap]  
**Status:** Same PR — `star-map-paths.ts`, configurable `MemberProgressDrawer` props, `contents`/`scenarios` response normalization. Legacy `/scenario-history` + `/roleplays/.../attempts` remain default for Scenarios back-compat; flashcards keeps adapter routes until optional alias migration.

### FL-021 — Leaderboard `scope=category` wire token
**Category:** [platform-gap]  
**Step:** 7  
**Detail:** `LeaderboardPanel` hardcoded `scope=category`; gamification router only accepted that token though service uses `masteryDimensionSlug` internally.  
**Status:** Same PR — `masteryScopeToken` prop (default `category`), server `resolveLeaderboardScope` accepts dimension slug (e.g. `topic`) with back-compat.

### FL-001 — basic-app stale pins
**Category:** [boilerplate]  
**Status:** Same PR — `examples/basic-app` bumped to `^0.1.1` / `^0.1.2` for server-kit.

**Checkpoint:** Published manually as `brayg` (CI `NPM_TOKEN` invalid — see [bray-platform#6](https://github.com/heybray-labs/bray-platform/pull/6)). Pins bumped to `@heybray/gamification@^0.2.0`, `@heybray/gamification-react@^0.2.0`, `@heybray/react@^0.1.2`, `@heybray/taxonomy@^0.1.2`. Flashcards adopts `masteryScopeToken="topic"`, `gamificationContentType: "deck"`, `ContentListRowComponent`, and `GamificationService.setRewardTiers`.

---

## Phase 6A — Step 2 (accepted conventions)

### FL-6A2-001 — Package-specifier `vi.mock` convention
**Category:** [accepted convention]  
**Detail:** Same as Scenarios Step 2 report — path-based mocks break once SUT imports move to package specifiers. Flashcards has no LLM mocks today (zero test edits on extraction); adopt package-specifier mocking in `bray-app-template` harness next time the template is touched.  
**Action:** Template only (deferred).

### FL-6A2-002 — `migrationsDir: null` for extracted feature packages
**Category:** [accepted convention]  
**Detail:** Feature packages with pre-extraction migration history export `migrationsDir: null`; historical SQL stays in the standalone shell. Premium composes platform + both app schemas and generates its own `0000`. Flashcards shell keeps `drizzle/0000`–`0002`.  
**Action:** None — convention locked for 6A premium shell.

---

## Phase 6A — Step 4 follow-up (0.1.1 package API)

### FL-6A4-001 — `registerDomainRoutes` + star-map drill-in handlers
**Category:** [platform/package API]  
**Detail:** Composed shells cannot call full `registerRoutes()` without duplicating platform routers. `@heybray/flashcards-server@0.1.1` exports `registerDomainRoutes()` and `@heybray/flashcards-server/team-star-map` drill-in functions.  
**Action:** Shipped in 0.1.1.

### FL-6A4-004 — `PackageLayoutProvider`
**Category:** [client package API]  
**Detail:** `@heybray/flashcards-client@0.1.1` exports `PackageLayoutProvider` / `usePackageLayoutEnabled` so composed shells disable in-package `AppLayout`.  
**Action:** Shipped in 0.1.1.

### FL-6A4-007 — Raw `.ts` feature package source
**Category:** [accepted convention]  
**Detail:** Feature packages publish raw TypeScript (`main` → `src/index.ts`), unlike platform `dist/` packages. Consumable only by tsx/vite shells.  
**Action:** Document in scaffold ADR (6B).
