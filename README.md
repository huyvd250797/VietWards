# VietWards V0.7.0 — Legacy Administrative Atlas

Vietnam administrative education web app (Next.js/TypeScript, MapLibre, responsive PWA). Deploy directly to Vercel without a local server for end users.

## Features

- Two snapshots: **before 2025-07-01** (63 provinces, 696 historical districts, 10,035 communes/wards/towns) and **current** (34 provinces, 3,321 communes/wards/special zones, selected 2026 changes).
- Province GIS, historical province split/merge, current commune GIS, GIS click/zoom/dim, searchable administrative lists.
- **New in V0.7.0:** Three-level legacy atlas (province → district → ward), old-to-new and new-to-old relations with partial-area indication, cross-period ward navigation, shareable historical ward URLs.
- GIS historical communes: loader/verification infrastructure is implemented, but **no certified, rights-cleared pre-merger ward polygons are included** (0/63 provinces). Until imported, the UI displays catalogued administrative relations and warnings rather than inventing polygons.
- Source and date provenance and robust fallback for remote GIS failures; no account or SQL migration.

## Deployment

Push the contents of this ZIP to GitHub, import to Vercel, select Next.js and Node 22.x. Build command: `npm run build`. No environment variables required for default operation.

## Checks

```bash
npm install
npm run check:structure
npm run check:data
npm run check:province
npm run check:history
npm run check:communes
npm run check:legacy
npm run typecheck
npm run lint
npm run build
```

See `docs/RELEASE-V0.7.0.md`, `docs/QA-REPORT-V0.7.0.md`, `docs/DATA-PROVENANCE.md` and `THIRD_PARTY_NOTICES.md`. Historical GIS imports require explicit verified manifest metadata and license clearance. No source release claims that unverified polygons are legal boundaries.
