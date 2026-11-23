# QA Report — VietWards V0.2.0

## Verified in the construction environment

- V0.1.0 ZIP used as the exact baseline; structure and UI pages retained.
- `npm run check:structure`: PASS (27 required files, v0.2.0).
- `node --check scripts/verify-data.mjs`: PASS.
- All 18 TS/TSX modules passed TypeScript transpiler syntax diagnostics (semantic typecheck requires installed packages).
- Source dataset inspected via its GitHub repository: counts 63/696/10,035 old, 34/3,321 new, old-to-new conversion 10,035 rows.
- Both 2026 ward reclassification sets inspected against source: 10 Dong Nai + 12 Bac Ninh. One GSO spelling variant `Hiệp Hoà` versus `Hiệp Hòa` is handled by accent-insensitive matching while displaying canonical spelling from 2026 resolution.
- Source mapping independently checked: 63/63 former provinces map to 34/34 current provinces, 0 mismatched old-to-new province mappings in underlying conversion tables.

## Not verified in this environment

- Dependencies from npm could not be installed because outbound npm registry/DNS access is unavailable.
- Therefore **full** TypeScript typecheck, lint, Next production build and end-to-end UI tests have **not** been run here. CI workflow is prepared to perform `npm install`, `check:structure`, `check:data`, typecheck, lint, build on GitHub.
- No live Vercel deployment or user's GitHub repo modifications were performed.

## Explicitly out of scope

- MapLibre polygon rendering (V0.3.0); province list to map synchronization (V0.4.0); GIS geometry history (V0.5–0.7); sourced area/population/vehicle plates (V0.8.0).
