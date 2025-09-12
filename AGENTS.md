# Repository Guidelines

## Project Structure & Module Organization
- `src/` React app (feature folders, `components/`, `apps/` for Main/EdBotz/RTDConnect entry points).
- `public/`, `public-second/`, `public-rtdconnect/` hosting roots per site.
- `functions/`, `functions-triggers/`, `functions-rtdlearning/` Firebase Cloud Functions codebases.
- `scripts/` build/dev helpers (e.g., `build.js`).
- `assets/`, `docs/` static content and documentation.
- Env files: `.env*` control runtime (e.g., `REACT_APP_SITE`, emulator flags).

## Build, Test, and Development Commands
- `npm run start:main` — start main site locally.
- `npm run start:second` / `start:rtdconnect` — start other site variants.
- `npm run start:main:functions-genkit` — run UI + Functions emulator + Genkit UI together.
- `npm run start:emulators:functions-only` — Functions emulator only.
- `npm run build:main` (or `build:second`, `build:rtdconnect`) — production build.
- `npm run deploy:main` (or `deploy:second`, `deploy:rtdconnect`) — build and deploy hosting target.
- `npm run clean` / `cleanup:all` — clean build artifacts and free dev ports.

Example: start main with Functions emulator
```
REACT_APP_USE_FUNCTIONS_EMULATOR=true npm run start:main
```

## Coding Style & Naming Conventions
- JavaScript (React 18), functional components, hooks; 2‑space indent, semicolons, single quotes.
- Components: PascalCase files (e.g., `PaymentEligibilityCard.js`). Helpers/utilities: camelCase functions.
- CSS: Tailwind via `tailwind.config.js` and PostCSS; co-locate styles in `src/styles/` when needed.
- Prefer feature folders under `src/` and keep shared UI in `src/components/`.

## Testing Guidelines
- No formal test runner configured. Add targeted checks as scripts under `scripts/` or collocate small smoke tests.
- Validate changes across all relevant sites (`main`, `second`, `rtdconnect`) using the start scripts.
- If introducing a test harness, prefer Jest for unit tests and Cypress for E2E; name tests `*.test.js` next to sources.

## Commit & Pull Request Guidelines
- Use Conventional Commits where possible: `feat:`, `fix:`, `refactor:`, `chore:`; scope optional (e.g., `feat(payment): ...`).
- PRs must include: clear summary, scope of impact (which site variants), linked issues, and screenshots for UI changes.
- Keep PRs focused; avoid unrelated refactors. Do not commit secrets — use `.env*`.

## Security & Configuration Tips
- Use Firebase emulators for local testing; avoid live data changes.
- Verify `firebase.json` targets before deploying; deploy with `deploy:*` scripts to the correct hosting target.
