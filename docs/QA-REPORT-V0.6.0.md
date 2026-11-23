# QA Report — VietWards V0.6.0

## Local source verification

| Test | Check | Status |
|---|---|---|
| Release structure | `node scripts/check.mjs`, 39 required files | PASS (2026-11-23, local Node.js 22) |
| Commune search and scope | `npm run check:communes` | PASS (2026-11-23, local Node.js 22) |
| Province search and history | `npm run check:province` / `npm run check:history` | Requires `vn-local-divisions` package |
| Full data catalogue | `npm run check:data` | Requires `vn-local-divisions` package |
| TSX syntax | Parse/transpile using globally available TypeScript | PASS (2026-11-23, local Node.js 22) |
| TypeScript / ESLint | `npm run typecheck` / `npm run lint` | Not confirmed without npm dependencies |
| Vercel production | `npm run build` + manual deployment | Not confirmed without npm registry / deployed domain |
| Live GIS provider | Verify each province on live Vercel | Not confirmed comprehensively |

## Risk cases for real-device acceptance

1. Open `/ban-do?period=current&province=75`, click **Cấp xã/phường**, compare displayed list count with GIS matched count; test Bình Phước (25195).
2. Change province to Hà Nội; test leading-zero code (00004), filter Phường and search `ba dinh`.
3. Select another xã without reload; confirm selected polygon highlight and the rest dimmed.
4. Reset selected ward; return to province level; verify map province selection persists.
5. Open direct deep-link with valid/invalid ward; click browser Back/Forward and check displayed level.
6. Switch to `Trước 01/07/2025`; commune GIS must not pretend to show historic communes. Test existing split/merge provinces (2/3 predecessors).
7. Simulate GeoVN 503; catalog should remain functional; no fabricated polygon.
8. Check mobile bottom sheet on 375px viewport, dark mode, zoom/pan, no horizontal overflow.
9. Verify source terms and geospatial inaccuracies independently before claiming legally certified boundaries.

No SQL migration. Source includes no bundled GIS data files from third parties.
