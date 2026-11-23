# QA Report — VietWards V0.9.0

**Date:** 23 November 2026. Baseline: uploaded V0.8.0 ZIP.

| Quality gate | Status | Notes |
|---|---|---|
| Source structure | PASS | `node scripts/check.mjs` confirms V0.9.0 and required modules. |
| Verified data invariant | PASS | 63 historical + 34 current provincial records, 80 unique prefixes each snapshot and source references via `node scripts/verify-verified-stats.mjs`. |
| Educational logic | PASS | `node --experimental-strip-types scripts/verify-education.mjs`: default Đồng Nai/HCMC metrics, mixed-period refusal, source-grounded quiz logic. |
| Quality contract | PASS | `node scripts/verify-quality-gates.mjs`: 97 sourced records and explicit 0/63 historical GIS state. |
| Province search/history/commune/legacy regressions | PASS | Independent Node scripts operate without runtime dependencies. |
| TS/TSX parse | PASS | Local TypeScript syntax parse for all new and inherited TS/TSX files; semantic typecheck remains separate. |
| Full TypeScript semantic typecheck | NOT VERIFIED | Required npm dependencies unavailable in packaging environment. |
| ESLint | NOT VERIFIED | npm dependency installation blocked, so ESLint cannot be run here. |
| Next.js production build | NOT VERIFIED | npm registry not accessible from packaging environment. |
| Browser/E2E Playwright | NOT VERIFIED | Browser smoke specs and GitHub CI job added, not executed against a running Next.js application here. |
| Vercel deployment / live GIS | NOT VERIFIED | No production deployment or external GIS reliability measured. |
| Historic commune GIS verification | INCOMPLETE | 0/63 pre-merger provinces ship verified commune polygons. Do not claim this part is complete. |

## Post-deployment acceptance cases

1. `/hoc-dia-ly?tab=compare&period=current&a=75&b=79` highlights Đồng Nai blue and TP. Hồ Chí Minh teal; all other provinces darken. Default values 12,737.18 vs 6,772.59 km² and administrative populations 4,491,408 vs 14,002,598 people, each with their 2025-06-12 reference.
2. Choose Hà Nội for A. The interface must suppress population/density delta when comparing 2024 *statistical-average* vs 2025 *administrative-scale* populations.
3. Current period: plate 93 quiz answer = Đồng Nai; legacy period: plate 93 answer = Bình Phước. Wrong answers reveal a correct explanation.
4. Quiz map-click questions must accept only valid GIS features; if GIS is unreachable, alternative choice buttons must work.
5. Test direct sharing URL, reload, browser Back/Forward, mobile bottom navigation and responsive widths 320–430 px.
6. Verify MapLibre can still load and highlight 34/63 provinces for both time periods; published GIS is cartographic reference only.
7. Run `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`, and test a live Vercel URL. CI Playwright geometry fixtures prove interaction behavior only, not geographic accuracy.

**Release gate:** V0.9.0 is an educational/QA development release, not an assertion that V1.0.0 public launch requirements have been achieved.
