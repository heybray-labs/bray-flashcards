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
