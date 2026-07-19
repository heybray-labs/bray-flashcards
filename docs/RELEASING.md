# Releasing

This repo has **two distinct artifacts**: the private root app (never published) and the
published npm feature packages.

## Root app (`bray-flashcards`)

- **`private: true`**, version **`0.0.1`** — not versioned or released
- No tag-triggered Docker/GHCR publish (unlike `bray-scenarios`)
- Deploy by cloning and building locally or via `docker compose up --build`

## Published packages

| Package | Path |
|---------|------|
| `@heybray/flashcards-server` | `packages/flashcards-server` |
| `@heybray/flashcards-client` | `packages/flashcards-client` |

### Release mechanics

**Trigger:** push to `main` (`.github/workflows/release.yml`) — **not** a git tag.

On each push:

1. CI runs `npm ci`, typecheck, and build
2. `changesets/action@v1` runs:
   - If pending changesets exist → opens/updates a **Version Packages** PR on branch
     `changeset-release/main`
   - If no pending changesets (Version Packages PR already merged) → **`npx changeset
     publish`** to npm with provenance

Every platform or feature-package change needs its own **changeset file** in the same PR
(`npx changeset add`).

### Consumer pin bumps

After packages publish, bump `@heybray/flashcards-*` pins in consumer repos (`bray-premium`,
apps built from the template) via separate PRs — see `docs/DEVELOPMENT.md` outer loop.

**Do not merge consumer pin bumps that depend on unpublished package APIs** — fresh clones
must resolve everything from npm.
