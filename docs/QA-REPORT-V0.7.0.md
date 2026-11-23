# QA — VietWards V0.7.0

| Test | Status / evidence |
|---|---|
| ZIP base verified and extracted | PASS |
| Structure | `node scripts/check.mjs` — PASS, release 0.7.0 |
| GIS provenance gate | `node scripts/verify-legacy-atlas.mjs` — PASS, verified GIS province count 0/63 |
| Syntax | TypeScript parser across `src/**/*.ts(x)` — PASS, no parse diagnostics |
| Legacy catalogue counts / mapping correctness | Prior library provides 63 / 696 / 10,035. Executable `npm run check:data` must be run after dependency installation |
| Mapping UI and period-switch behavior | Code paths inspected; interactive browser tests pending |
| Typecheck / ESLint | NOT VERIFIED (node_modules/npm registry unavailable in authoring sandbox) |
| `npm run build` | NOT VERIFIED (node_modules/npm registry unavailable) |
| GitHub Actions / Vercel production | NOT VERIFIED; requires actual repository deployment |
| GIS old ward polygons | NOT AVAILABLE: 0/63 provinces in shipped manifest |

## Acceptance test matrix after deployment

1. Direct link `/ban-do?period=before&province=75&level=commune` should load legacy catalogue; filter old district and search no accents.
2. Pick a 5-digit legacy ward code; confirm district name, parent province and source displayed; mapping list shows one/many new wards and partial flags.
3. Follow a successor; verify period changes to `current`, 34-province catalogue and correct current code/parent province; reverse navigation works.
4. Use period toggle with a ward that maps to exactly one unit; verify automatic counterpart selection.
5. Use period toggle with a split ward or a current ward with several sources; verify the app lists **all** alternatives without choosing one automatically.
6. Open current ward map and click polygon; highlight works as in V0.6.0.
7. Visit legacy ward map without loaded historical GIS; verify explicit warning, no fabricated polygon, optional old provincial outline only.
8. Try bad province/ward/district codes at API level; expect validation errors, not unrelated units.
9. Test 375px mobile: map controls, scrollable lists, bottom sheet, dark mode, keyboard focus; ensure no overflow.
10. Test missing historical province GIS source, blocked third-party GIS and Vercel cold start; administrative catalogue stays accessible.
11. After licensed polygon import, run `npm run check:legacy` and visually compare every province's topology/coverage; do not consider `matchedCount` alone proof of geographic accuracy.
