# QA Report — VietWards V1.1.2 (24/11/2026)

## Input and root cause

The exact uploaded `VietWards-V1.1.1-Roadmap-Typecheck-Hotfix(1).zip` (124 files) was used.

`src/app/gioi-thieu/page.tsx` checked `UX_ROADMAP` values against `"partial"`, although the UX roadmap uses only `done | current | planned`. This caused Vercel TS2367. The original V1.1.1 patch guarded only the *foundation* roadmap.

## Fix

- Two distinct literal status unions + `satisfies` on both roadmap arrays in `src/lib/config.ts`.
- Exhaustive typed `UX_ROADMAP_DISPLAY` state-to-badge mapping removes invalid comparisons from UX render.
- UX `done` milestones now correctly display **ĐÃ TRIỂN KHAI** rather than **KẾ HOẠCH**.
- CI adds `check:roadmap-states` and `typecheck:roadmap`, and retains full `typecheck`, lint and Next production build.
- All app/runtime/PWA version indicators and tests updated to 1.1.2.

## Verified in packaging environment

- `npm run check:roadmap-states` — pass.
- `npm run typecheck:roadmap` — pass (global TypeScript v5.8.3; isolated test compiling actual exported roadmap statuses).
- `npm run check:structure` — pass.
- `npm run check:province` — pass.
- `npm run check:history` — pass.
- `npm run check:communes` — pass.
- `npm run check:legacy` — pass, legacy historical GIS still 0/63 verified.
- `npm run check:verified` — pass.
- `npm run check:education` — pass.
- `npm run check:qa` — pass.
- `npm run check:release` — pass.
- `npm run check:uiux` — pass.
- `npm run check:challenge` — pass.
- `npm run check:mobile-stability` — pass.
- `npm run check:design-system` — pass.
- `npm run check:hotfix` — pass.
- TypeScript/TSX parser — **52 files, 0 syntax diagnostics**.
- Global project `tsc --noEmit` (without project dependencies) — no TS2367 diagnostic emitted, but **not** a valid complete typecheck, as missing Next/React/Playwright produce TS2307/TS7026 and similar failures.

## Not verified

- `npm run check:data` cannot complete locally because `vn-local-divisions` package is not installed.
- `npm run build` stops immediately at `next: not found` (Next.js not installed). Thus no successful production build, ESLint, or browser E2E validation is claimed.
- Deploy on Vercel and check `/gioi-thieu` & `/api/health` after dependencies are installed.

## Scope

No changes to administrative data, GIS, educational question bank, database or SQL migration.
