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
