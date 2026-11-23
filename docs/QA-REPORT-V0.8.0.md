# QA — VietWards V0.8.0 — Verified Statistics & Plates

Verified date: **23 November 2026**. Work done against the user's uploaded V0.7.0 source ZIP.

| Check | Status | Detail |
|---|---|---|
| Data invariants | **PASS** | `node scripts/verify-verified-stats.mjs`: 63 old + 34 current records; 23 merged units use administrative 2025 values; 11 unchanged units use statistical 2024 values. |
| Vehicle plates | **PASS** | 80 unique provincial two-digit codes in each period; old and new prefixes unique within period; code 80 is reserved for Traffic Police Department. |
| Source attribution | **PASS** | All 97 province statistical records and plate assignments resolve to populated HTTPS source metadata. |
| Key historical example | **PASS** | Đồng Nai current area 12,737.18 km², administrative population 4,491,408, plates 39/60/93; legacy Đồng Nai 39/60 and legacy Bình Phước 93. |
| Source structure | **PASS** | `node scripts/check.mjs`: required source files present, version 0.8.0. |
| Province Explorer regression | **PASS** | `node --experimental-strip-types scripts/verify-province-explorer.mjs`: search, filtering and deep links. |
| Historical province conversion regression | **PASS** | `node --experimental-strip-types scripts/verify-historical-selection.mjs`: 1/2/3 parents, invalid codes, grouping. |
| Current + legacy commune navigation | **PASS** | `node --experimental-strip-types scripts/verify-commune-explorer.mjs`: search, code, API boundary contract, dual-period navigation. Previous V0.6 assertion incorrectly required current-only mode, corrected. |
| Legacy atlas provenance | **PASS** | `node --experimental-strip-types scripts/verify-legacy-atlas.mjs`: verified-only historical GIS loader and empty manifest. Corrected package test script to enable Node strip-types. |
| TypeScript syntax | **PASS** | Parse of all 32 TS/TSX modules with locally available TypeScript parser; zero syntactic errors. |
| ZIP integrity | **PASS** | Final release archive tested with ZIP CRC and file count after packaging. |
| Full typecheck / lint | **NOT VERIFIED** | npm packages not present; registry not accessible from packaging environment. |
| Next.js production build | **NOT VERIFIED** | `npm install --offline` fails with `ENOTCACHED` for `@types/node`; cannot run the Next.js builder. |
| Browser GIS + Vercel runtime | **NOT VERIFIED** | No deployed Vercel instance for end-to-end testing; upstream GIS requests may be unavailable. |

## Known limitations and policy for acceptance

- Verified pre-2025 commune polygon coverage in shipped ZIP remains **0 of 63 provinces**; no replacement was faked or inferred.
- No fully sourced per-commune population or area dataset. Commune cards show a missing-data message and the *provincial* plate prefixes only.
- Of the current 34 provinces, 11 are represented by older (2024) statistical population for purposes of transparent sourced information. They are NOT labeled 2026 live estimates. Population differences from 2025 administrative-resolution figures are **not** treated as demographic change.
- Code-prefix search is at provincial level, not a vehicle registration or ownership lookup.
- A successful static syntax/contract test is not equivalent to Vercel runtime success; review Vercel's production build logs and repeat the smoke tests after deployment.

## Suggested production smoke tests

1. Select Đồng Nai current on Province Explorer, observe 12.737,18 km², 4.491.408 administrative population, plate 39/60/93, and source links.
2. Switch to before July 2025; select Bình Phước and confirm only plate 93 with *2024 statistical* population; area reference date 31/12/2023.
3. Search plate 93 in both periods: Bình Phước (before) vs Đồng Nai (current). Search 80; confirm it is not assigned to a province.
4. On Map Explorer, select both single and grouped historical regions and confirm no stale data appears after a period change.
5. Select any commune. Confirm no estimated population/area; show its managing province's plates clearly labeled.
6. Select a historical commune without verified GIS and confirm it has administrative text relations but no invented polygon.
7. Check narrow mobile widths, light/dark theme, keyboard navigation and Page Load JS/GIS errors in console.
8. Run `npm run typecheck`, `npm run lint`, `npm run build` on a machine with npm registry access and confirm Vercel Node 22.x deployment.
