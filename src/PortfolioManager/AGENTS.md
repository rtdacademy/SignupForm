# Repository Guidelines
## Project Structure & Module Organization
- src/ hosts the React app; group features by domain and keep shared UI under src/components/. Entry points for Main, EdBotz, and RTDConnect sit in src/apps/.
- Hosting roots live in public/, public-second/, and public-rtdconnect/; keep branding assets co-located with each site.
- Firebase automation resides in unctions/, unctions-triggers/, and unctions-rtdlearning/. Run scripts from scripts/. Store static collateral under ssets/ and docs/.
- Configure runtime behavior with .env* (e.g., REACT_APP_SITE, REACT_APP_USE_FUNCTIONS_EMULATOR).

## Build, Test, and Development Commands
- 
pm run start:main starts the main site; toggle the functions emulator with REACT_APP_USE_FUNCTIONS_EMULATOR=true.
- 
pm run start:second and 
pm run start:rtdconnect spin up the other variants.
- 
pm run start:emulators:functions-only runs only Firebase emulators for API work.
- 
pm run build:main (or uild:second, uild:rtdconnect) creates production bundles.
- 
pm run deploy:main (or deploy:second, deploy:rtdconnect) builds and deploys to the configured Firebase hosting target.
- 
pm run clean and 
pm run cleanup:all reset build artifacts and free dev ports.

## Coding Style & Naming Conventions
- JavaScript/React 18 with 2-space indentation, semicolons, single quotes, and functional components.
- Name components in PascalCase (e.g., PaymentEligibilityCard.js); helper utilities use camelCase.
- Tailwind is configured via 	ailwind.config.js with PostCSS; place custom styles in src/styles/.

## Testing Guidelines
- No global test runner yet; write targeted scripts under scripts/ or colocate smoke tests. Document manual verification steps per site variant.
- When adding tests, prefer Jest for unit coverage (*.test.js) and Cypress for E2E. Ensure new code paths run across main, second, and RTDConnect.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (e.g., eat(payment): add autopay toggle). Keep changes scoped to a single concern.
- PRs should include a succinct summary, impacted site variants, linked issues, and screenshots for UI changes.
- Run relevant build/start commands before opening a PR and call out any emulator requirements.

## Security & Configuration Tips
- Default to Firebase emulators for local testing; avoid mutating live data or config.
- Verify irebase.json targets before deploying and use the deploy:* scripts for the correct hosting bucket.
- Keep secrets out of version control; rely on .env* and Firebase config.
