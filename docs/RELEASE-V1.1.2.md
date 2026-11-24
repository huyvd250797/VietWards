# VietWards V1.1.2 — Roadmap Status Type Safety Fix

Baseline: ZIP V1.1.1 supplied by the user. This is a deploy-only hotfix without feature/data changes.

## Root cause

`UX_ROADMAP` has literal states `done | current | planned`. The About page erroneously compared `status === "partial"` (a state belonging solely to foundation `ROADMAP`), so the Next.js TypeScript check produced TS2367 at `src/app/gioi-thieu/page.tsx:38`.

## Fix

- Explicit separate TypeScript status unions, checked using `satisfies` for both roadmaps.
- Exhaustive typed `UX_ROADMAP_DISPLAY` lookup, no impossible status comparisons.
- UI badges now correctly distinguish already delivered V1.0.3, current V1.1.0, and future roadmap milestones.
- Automated test checks **both** roadmap render blocks, and CI runs TypeScript roadmap contract in addition to complete typecheck and build.
- Version metadata, app chrome, tests, SW cache bumped to V1.1.2.

## Deploy and verification

1. Replace source files with V1.1.2. Ensure old files deleted if source sync is replace-all.
2. Run `npm install`, then `npm run check:roadmap-states`, `npm run typecheck:roadmap`, `npm run typecheck`, `npm run lint` and `npm run build`.
3. After Vercel builds, inspect `/gioi-thieu` for correct states and `/api/health` for version 1.1.2.

No migration. GIS and educational data unchanged.
