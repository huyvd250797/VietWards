# VietWards V0.9.0 — Educational Experience & QA

VietWards is a Vietnamese educational geography PWA built with **Next.js App Router, React 19, TypeScript, MapLibre GL JS** and a canonical administrative database. Deploy the source directly to Vercel from GitHub; visitors need no user accounts or local servers.

## What's new in V0.9.0

Open **Học địa lý** (`/hoc-dia-ly`) in the desktop sidebar or mobile bottom navigation:

- **So sánh**: two province selectors synchronized with a two-color MapLibre map, darkened other provinces, fit-to-bounds camera, a side-by-side statistical table and provenance links. Defaults to **Đồng Nai (75)** versus **TP. Hồ Chí Minh (79)**. Share the comparison with `?period=current&tab=compare&a=75&b=79`. Directly compare *population, area and density differences only if the source type, reference period and relevant reference dates are compatible*; mismatches remain visible without fabricated delta.
- **Khám phá**: guided five-step learning flow through location, area, population, vehicle registration prefixes and pre-merger provinces, with source links and map/history navigation.
- **Thử thách**: deterministic, source-linked multiple-choice quizzes and click-the-province map questions; alternative button answers work when GIS/WebGL is unavailable. Record the best result in browser storage per historical period, without a login.
- **Kiểm chứng**: live data coverage counts for 34/63 provinces and 97 provincial statistical records, with explicit warnings about uncertified third-party GIS and the unavailable pre-2025 commune geometry.
- **QA**: data comparison and plate-prefix invariants, educational question tests, provenance/quality gate tests, plus a Playwright browser smoke suite for desktop and mobile (uses **synthetic GIS fixtures for UI behavior tests only**, not to assert legal boundary accuracy).

V0.9.0 builds on all existing V0.8.0 features: national province GIS for current and pre-2025 periods; administrative search, historical relationships, current commune GIS loaded per province; legacy three-level catalog and conversion; 97 sourced province statistic records and vehicle registration prefixes.

## Run and deploy

1. Push all source files in this ZIP to GitHub (repository root). Node.js **22.x**.
2. Import the repo in [Vercel](https://vercel.com/new) and keep the autodetected **Next.js** framework. No database or environment variables are required for basic functionality.
3. On Vercel, verify build logs and open `/hoc-dia-ly?tab=compare&a=75&b=79` on a desktop and mobile device. MapLibre geometry is loaded from documented external sources through application API routes; those sources must be reachable.
4. For development (optional): `npm install && npm run dev`. **End users never need localhost.**

## Quality checks

```sh
npm run check:structure
npm run check:province
npm run check:history
npm run check:communes
npm run check:legacy
npm run check:verified
npm run check:education
npm run check:qa
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Playwright browser tests require `npx playwright install chromium`; the GitHub CI `browser-smoke` job installs the browser. Playwright tests mock GIS responses using synthetic regions to test UI only; verify **live GIS** with `npm run check:gis:online` and real-browser inspection separately. The last command relies on upstream connectivity.

## Release limitations and provenance

- **GIS polygons before July 2025 at commune level:** **0/63 provinces** verified and packaged. V0.7.0's strict provenance gateway remains; missing regions are not invented. Do not describe national legacy commune GIS as complete.
- **Current GIS:** third-party cartographic reference, not certified legal boundary geometry. Check third-party licensing and rights to redistribute before publishing.
- **Population:** 23 merged provinces use **2025 administrative-scale population**, 11 unchanged ones use **2024 statistical-average population**, and 63 legacy provinces use **2024 statistical averages**. These must be interpreted by their own reference periods, not as live 2026 estimates.
- **Area:** see each province's source reference date; don't replace published values with polygon-computed values.
- **Communes:** no comprehensive sourced per-commune population/area dataset is bundled; this information remains unavailable rather than estimated.
- **Production QA:** browser, build and live GIS runtime must be confirmed by CI/Vercel; passing code structure and pure logic checks alone does **not** certify runtime or GIS accuracy.

See `docs/RELEASE-V0.9.0.md`, `docs/QA-REPORT-V0.9.0.md`, `docs/VERIFIED-STATISTICS-PROVENANCE.md`, and `THIRD_PARTY_NOTICES.md` for detailed notes. No SQL migration is required.
