# VietWards V1.1.1 — QA Report

## Root cause

- 4 `TS2367` reports in `src/app/gioi-thieu/page.tsx` and 3 in `src/components/home-dashboard.tsx` stem from `ROADMAP`'s `as const` status type being only `"done" | "partial"`. Old code compared it against `"current"`.
- The `UX_ROADMAP` intentionally contains a `"current"` phase; that status is preserved in its UI.

## Changes

1. Removed unreachable `"current"` comparisons only in the foundational `ROADMAP` renderers.
2. Retained the partial historical GIS warning; the partial milestone is not marked fully completed.
3. Corrected UX roadmap Mobile UX Stabilization from duplicate V1.1.0 to V1.0.3.
4. Updated version/package/PWA cache metadata to V1.1.1 and version assertions across independent tests.
5. Updated the Home/About E2E roadmap scope to distinguish 10 foundational milestones and 11 UX milestones.
6. Added `check:hotfix` to CI to guard against the same regression.

## Test results in packaging environment

| Check | Status |
|---|---|
| `npm run check:hotfix` | PASS |
| `npm run check:structure` | PASS |
| `npm run check:release` | PASS |
| `npm run check:qa` | PASS |
| `npm run check:design-system` | PASS |
| `npm run check:uiux` | PASS |
| `npm run check:mobile-stability` | PASS |
| `npm run check:province` | PASS |
| `npm run check:history` | PASS |
| `npm run check:communes` | PASS |
| `npm run check:legacy` | PASS |
| `npm run check:verified` | PASS |
| `npm run check:education` | PASS |
| `npm run check:challenge` | PASS |
| TypeScript transpile syntax of 52 TS/TSX source and E2E files | PASS |
| Isolated TS semantic check of `ROADMAP` and `UX_ROADMAP` status branches | PASS |
| `node --check` all `.mjs` scripts and service worker | PASS |
| `npm run check:data` | NOT RUNNABLE: dependency `vn-local-divisions` absent |
| `npm run typecheck`, `npm run lint`, `npm run build` | UNVERIFIED: dependencies absent |
| `npm install --offline` | BLOCKED: npm cache lacks `@playwright/test` |
| Vercel deployment and browser E2E | UNVERIFIED |

**Do not claim a production build has passed.** Run the install, typecheck, lint, and build steps in CI/Vercel and inspect logs before production rollout. No SQL migration is required. All GIS sources and statistical data remain unchanged.
