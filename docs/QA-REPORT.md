# QA Report — VietWards V0.3.0

## Checks achievable in packaging environment

- Source ZIP extracted from the supplied V0.2.0 release; no deleted application routes.
- Added map API route, MapLibre component, map styling and 2026 branding.
- `scripts/check.mjs` verifies required files and version 0.3.0.
- TypeScript/TSX parse check possible with global TS compiler syntax parser.

## Checks not completed in the packaging environment

- `npm install`, `npm run typecheck`, `npm run lint`, `npm run build`: npm registry network DNS unavailable in this session.
- Server GIS reachability and geometry count at deployed runtime: cannot make HTTP requests from packaging environment.
- Browser rendering on live Vercel URL: not deployed in this session.

## Required pre-release QA in GitHub / Vercel

1. CI `npm install && npm run check:structure && npm run check:data && npm run typecheck && npm run lint && npm run build`.
2. Deploy to Vercel Node 22 and open `/api/map-boundaries?period=current` and `?period=before`: both status 200, 34/63 features, matchedCount and unmatchedNames reviewed.
3. Click at least 10 diverse regions, including at least one MultiPolygon (islands); confirm selected-region coverage and reset.
4. Switch periods repeatedly; confirm no stale geometry or selection.
5. Test portrait iPhone/Android and desktop light/dark mode; check error/retry with GIS server unavailable.

## Known limitation

Legacy GIS names may not match every canonical province record. Do not assume full verified coverage merely because GeoJSON contains 63 features. Audit `metadata.matchedCount`, `metadata.unmatchedNames` after deployment.
