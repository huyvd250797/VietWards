# VietWards V0.8.0 — Verified Statistics & Plates

An interactive Vietnamese administrative education web app (Next.js App Router, TypeScript, MapLibre GL JS and responsive PWA) deployable directly to Vercel. End users do not run localhost and no account or SQL database is needed.

## Features

- Two administrative snapshots: **before 01/07/2025** (63 provinces, 696 historical districts and 10,035 communes/wards/towns) and **current** (34 provinces and 3,321 commune-level entities at the 2025 baseline, with supported 2026 changes).
- GIS province map (two periods), province split/merge, current commune-level GIS, historical three-level province→district→commune catalogue and relation cross-links.
- **New in V0.8.0:** Published area and population data for **all 63 legacy** and **all 34 current** provinces; population clearly labeled as **2025 administrative scale** for the 23 merged units and **2024 statistical mean** for the 11 unchanged units. Legacy stats use the **2024 NSO yearbook**, with area referenced to **31/12/2023**.
- Two-period vehicle registration plate code tables, 63 old + 34 current provinces, with exact two-digit code lookup, and special recognition of police **code 80**.
- Statistics visible in Province Explorer, selected map region details and commune panel. Each metric shows dates, kind and official source links; density is derived only from displayed area and population of the same official record.
- Commune-level area/population is **not extrapolated**: unavailable data is labeled. Commune panel displays the corresponding **provincial** vehicle plate codes.
- Cited reproducible transcription script `scripts/seed-verified-data.py`, source JSON and invariant checker `scripts/verify-verified-stats.mjs`.

## Important scope limits

- **No certified, rights-cleared pre-merger commune GIS is bundled** (0/63 provinces). Historical commune lists and old/new conversion work, but the commune boundary view is not complete without verified geometry.
- Current GIS polygons use public reference datasets with original underlying geometry rights not independently verified; do not claim legal boundary accuracy.
- The 11 unchanged provinces currently show *2024 historical statistical population*, not a 2026 real-time census. Data is not silently updated or labeled “current population”.
- Province population figures from 2025 merging resolution and those from 2024 yearbook follow different methodologies/dates and **must not be interpreted as population growth**.
- These plate assignments describe provincial **two-digit prefixes**, not the identification of vehicle owners.

## Vercel deployment

Upload the source directory to a GitHub repository, import in Vercel as Next.js, select Node.js 22.x, and deploy. `npm install`, `npm run build` run on Vercel. No environment secrets or SQL migrations are required by default. GIS reference layers require third-party upstream connectivity when requested.

## Checks

```bash
npm install
npm run check:structure
npm run check:data
npm run check:province
npm run check:history
npm run check:communes
npm run check:legacy
npm run check:verified
npm run typecheck
npm run lint
npm run build
```

Local JS-only checks can be run without installing dependencies: `node scripts/verify-verified-stats.mjs` and `node scripts/check.mjs`.

Detailed coverage and source URLs are in `docs/VERIFIED-STATISTICS-PROVENANCE.md`, `docs/RELEASE-V0.8.0.md`, `docs/QA-REPORT-V0.8.0.md`, and `THIRD_PARTY_NOTICES.md`.
