# VietWards V1.0.1 — UI/UX QA Report

**Date:** 23 November 2026. **Baseline:** user-uploaded `VietWards-V1.0.0-Public-Release(1).zip` (100 files). **Scope:** mobile map interaction, province/commune full-screen details and Light/Dark Mode information contrast. This is a UI/UX patch and does not update administrative boundary datasets.

| Gate | Result | Evidence / limits |
|---|---|---|
| Input verification | PASS | Source archive name/version and existing modules inspected before modifications. |
| Structural and release checks | PASS | `check:structure`, `check:release`, `check:qa`, `check:uiux`. |
| Province/history/ward logic checks | PASS | `check:province`, `check:history`, `check:communes`, `check:legacy`. |
| Source statistics and educational logic | PASS | `check:verified`, `check:education`; 63 + 34 provincial records retained. |
| TypeScript/TSX syntax transpilation | PASS | 48 TS/TSX files (src and e2e); no syntax diagnostics. This does **not** replace semantic typecheck. |
| CSS behavior in Chromium | PASS (isolated browser fixture) | At 390 × 844: selected location's detailed panel is **hidden by default**; map selection action is visible; opening detail applies a **390 × 844 full-screen dialog**. CSS tested using current production stylesheet and representative HTML; **not a full Next.js app execution**. |
| Dark Mode contrast (Chromium) | PASS (isolated browser fixture) | Computed contrast against own card backgrounds: metric value **12.01:1**, plate text **9.03:1**, metric label **8.35:1**; all exceed 4.5:1. Light mode switches back to dark text/light background. |
| Modal/selection keyboard contracts | STATIC PASS | Explicit-open-only state, Escape, focus trap with hidden element exclusion, return focus to open button, body-scroll lock, safe-area spacing. Runtime interaction remains to be tested. |
| Browser E2E tests | PREPARED; NOT EXECUTED HERE | `e2e/mobile-map-ui.spec.ts` added; Playwright will run in CI with installed Next.js dependencies. |
| Next.js semantic typecheck, ESLint, production build | NOT VERIFIED | `npm install` timed out due to package network unavailability; no installed project dependencies. Cannot claim build success. |
| Live GIS/Vercel deployment | NOT VERIFIED | No production environment credentials or deployed environment test. Existing GIS providers still require availability/license verification. |
| Legacy commune historical GIS | UNCHANGED: INCOMPLETE | Still **0/63** verified legacy commune GIS province datasets packaged. No fabricated geometry. |

## Manual validation after Vercel deployment

1. On iPhone/Android open `/ban-do`, select Đồng Nai (map tap and list item separately), ensure the highlighted polygon remains visible and no large detail sheet automatically appears.
2. Use **Xem chi tiết**, verify full-screen details, title **Thành phố Đồng Nai**, and **Xem xã/phường trên bản đồ** action.
3. Close the modal with X, reopen it, and check focus + background scroll lock; on a physical keyboard, try Escape and Tab navigation.
4. Go to commune layer; select a ward, verify the same map-first behavior and full-screen ward detail.
5. Switch Dark/Light Mode; verify legibility of area, population, population period, density, license plate chips and sources.
6. Switch 34/63 periods, historic multi-selection, and check that the camera remains stable; check responsive desktop information panel is unaffected.
7. Run `npm install`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e` and verify GitHub Actions/Vercel logs. Do not promote to fully-accepted production status until these pass.

No SQL migration is needed; the app uses packaged data and existing GIS APIs.
