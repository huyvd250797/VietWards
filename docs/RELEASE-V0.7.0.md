# VietWards V0.7.0 — Legacy Administrative Atlas

Release date: 2026-11-23. Base source: `VietWards-V0.6.0-Commune-and-Ward-Explorer(1).zip`.

## Implemented

- Both periods support **two map levels**. Legacy uses 63 province entries, 696 old districts and 10,035 old wards/communes/towns; current uses 34 provinces and 3,321 present-day communes/wards/special zones.
- Old three-level catalogue is available directly in Map Explorer and in the History page. Filter by province, old district, name (accent-insensitive), type and five-digit code.
- Ward history lookup `/api/ward-relations?period=before|current&code=XXXXX` reports historical parents/successors and partial-area flags. Unresolved district-only references are counted, not promoted to made-up five-digit ward codes.
- Switch periods while exploring a ward: automatically navigate to a unique known counterpart; present all choices for one-to-many / many-to-one cases. Separate buttons on ward details also navigate to verified code-matched counterparts.
- Deep links support both periods: `/ban-do?period=before&province=75&level=commune&ward=XXXXX`, where each code must be from the **same** chosen legacy province.
- Reuse current GIS features, source architecture and progressive caching; retain PWA, responsive PC/mobile and Vercel deploy.
- Optional local GIS ingest gate: `public/data/legacy/manifest.json` and `public/data/legacy/wards/{provinceCode}.geojson`. Strict official five-digit-code matching, historical snapshot and provenance checks.
- If legacy GIS is absent, display a clearly labeled optional **province outline** only (using old province reference source); the old ward itself is **not** highlighted or drawn as a fake polygon.

## Important incomplete requirement

**Legacy ward/commune GIS coverage in this ZIP: 0 of 63 provinces.** A rights-cleared, independently verified historical nationwide polygon set matching the date 2025-06-30 was not located in this environment. Therefore V0.7.0 implements the full legacy **catalogue, district navigation and relationship UX**, plus an acceptance path for certified GIS, but does **not** complete the geospatial historical split/merge view at commune level. The release must NOT be described as full GIS completion.

The old province map already in V0.3.0 is an external cartographic reference, not legal evidence. No old commune coordinates are created by slicing current polygons, estimating areas or matching ambiguous names.

## Data and sources

- Legacy and current codes/mapping: `vn-local-divisions@1.0.1` (community MIT package; based on GSO and administrative merger texts). Source https://github.com/mtri-git/vn-local-divisions.
- Official priorities: NSO/GSO catalogue, Decision 19/2025/QD-TTg, province and commune merger resolutions; see `docs/DATA-PROVENANCE.md`.
- Present-day GIS: GeoVN, previously integrated under V0.6.0. Source https://github.com/truongdinh018/GeoVN.
- Legacy GIS: no national dataset shipped or claimed. Provenance and actual geographic boundaries require verification before distribution.

## Deployment

1. Push source to GitHub (do not push `node_modules`, `.next`, `.env`).
2. Connect repository to Vercel. Framework Next.js, Node 22.x, standard build command `npm run build`.
3. No SQL migration or login needed. Runtime external GIS requests require Vercel access to the original sources.
4. Run checks: `npm run check:structure`, `npm run check:data`, `npm run check:province`, `npm run check:history`, `npm run check:communes`, `npm run check:legacy`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Importing verified old commune GIS

Only when there is a properly licensed historical GeoJSON file that is **explicitly** based on the 2025-06-30 snapshot:

1. Place a valid FeatureCollection at `public/data/legacy/wards/75.geojson` (for example province code 75). Features must be Polygon/MultiPolygon with an official `properties.code` 5-digit string, matching a ward code in that old province. Prefer `properties.provinceCode` too.
2. In `public/data/legacy/manifest.json`, add entry `"75": { "file":"75.geojson", "sourceUrl":"https://source.example/verified-original", "license":"name and terms", "snapshot":"2025-06-30", "verified":true, "verifiedOn":"YYYY-MM-DD" }`. Use **real** source URL and verified facts; the placeholder above is illustrative only.
3. Cross-check code membership, polygon coverage, islands, MultiPolygon, overlaps and source license; run automated and visual checks on mobile/desktop. The server refuses parcels without correct codes and explicit verified provenance.
4. Where a commune transferred only part of its territory, an old complete commune polygon is not sufficient to attribute an exact part to a new commune. Additional partial-area geometry is required for precise spatial comparison.

## Acceptance status

Code/structure/parser checks pass locally. Vercel build, ESLint and real-device usage remain unverified until dependency installation and deployment. Historical commune-level GIS is explicitly incomplete.
