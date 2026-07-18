# Bray Flashcards

Phase 5 platform validation app — a flashcard/quiz trainer built entirely on published
`@heybray/*` npm packages. Proves a second gamified app can boot with minimal platform-side
changes.

- **Content type:** `deck` (study sessions, self-graded)
- **Mastery dimension:** `topic` (≠ Scenarios' `category`)
- **Manage permission:** `deck:manage` (≠ `roleplay:manage`)
- **No AI** — `@heybray/llm` is intentionally absent

## Local development

```bash
cp .env.example .env
npm install
npm run dev        # starts Postgres, migrates, API :3102, Vite :5175
```

## License

AGPL-3.0-only — see [LICENSE](LICENSE).
