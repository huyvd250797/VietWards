# VietWards V1.1.1 — Roadmap Typecheck Hotfix

Baseline: V1.1.0 — Unified Design System 2.0 (uploaded source ZIP).

## Root cause and fix

- `ROADMAP` in `src/lib/config.ts` is declared `as const`, with only `"done"` and `"partial"` literal statuses. Comparisons against `"current"` in `src/app/gioi-thieu/page.tsx` and `src/components/home-dashboard.tsx` therefore produced TypeScript `TS2367` and blocked `npm run build` on Vercel.
- Removed the unreachable `"current"` comparisons specifically for the **completed foundation roadmap**. Kept the `"partial"` GIS historical data warning visible. The UX roadmap retains `"current"`, which is a valid state there.
- Corrected the UX roadmap's duplicate V1.1.0 entry: **Mobile UX Stabilization** belongs to V1.0.3.
- Bumped app/package/PWA cache/presentational release metadata to **V1.1.1**. Core product functionality, GIS sources and data are untouched.
- Added `npm run check:hotfix` for regression coverage and removed the stale TypeScript incremental build cache from the release ZIP.

## Verification

Run on a machine/CI with installed dependencies:

```bash
npm install
npm run check:hotfix
npm run check:design-system
npm run typecheck
npm run build
```

The isolated code/data checks in the packaging environment do not replace the production TypeScript or Next.js build. Release as production-ready only after Vercel build passes.

**No SQL/database migration.**
