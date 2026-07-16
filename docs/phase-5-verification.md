# Phase 5 verification — `bray-flashcards`

Recorded after Steps 0–7. ADR: [`bray-platform/docs/app-shape-decision.md`](https://github.com/heybray-labs/bray-platform/blob/main/docs/app-shape-decision.md) (pending owner ratification).

## Automated suite

| Check | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | ✅ |
| Client build | `npm run build` | ✅ |
| API tests | `npm test` (Postgres :5435, 36 tests) | ✅ |
| Docker smoke | `docker build -t bray-flashcards:smoke .` | ✅ |

## Published package pins

All runtime deps from npm (no `file:` / `link:`):

- `@heybray/gamification@^0.2.0`
- `@heybray/gamification-react@^0.2.0`
- `@heybray/react@^0.1.2`
- `@heybray/taxonomy@^0.1.2`
- `@heybray/identity`, `@heybray/media`, `@heybray/ui@^0.1.1`
- `@heybray/server-kit@^0.1.2`
- No `@heybray/llm` in tree ✅

## Manual walkthrough

| Step | Result |
|---|---|
| Setup admin (`POST /api/auth/setup-admin`) | ✅ First-run creates admin |
| Create deck + cards + topic + cover | ✅ `POST /api/decks`, cards, `topic` classification, media upload |
| Publish deck | ✅ `POST /api/decks/:id/publish` |
| Study session as learner | ✅ Start → complete with self-grade |
| Points / star awarded | ✅ Gold tier at 100%, 50 points (default tiers) |
| Topic-scoped leaderboard | ✅ `scope=topic&category=science` shows learner |
| Team star map | ✅ Manager view, member drawer, session attempts |
| Whitelabel UI | ✅ "Bray Flashcards" + teal/emerald palette throughout |

## Acceptance notes

### `grep -ri "roleplay\|scenario" src/ server/`

Hits are **platform-compat adapter paths only** (FL-014), not user-visible Scenarios branding:

- `/api/teams/.../scenario-history`, `/roleplays/:id/attempts` (server routes + tests + `DeckListRow`)
- `drawerPink.scenarioRow` (CSS key from `@heybray/gamification-react`)
- Controller method names `getMemberScenarioHistory` (internal)

No user-facing "Scenarios" or "roleplay" strings in UI copy.

### Config-driven content model

- Content type: `deck` via `DECK_CONTENT_TYPE` / `gamificationContentType`
- Mastery dimension: `topic` via `MASTERY_DIMENSION_SLUG` / `masteryScopeToken="topic"`
- Manage permission: `deck:manage`
- Taxonomy endpoint: `/api/classifications`

Platform changes required: 2 changesets (see friction log Step 7 section).
