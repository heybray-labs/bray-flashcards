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
