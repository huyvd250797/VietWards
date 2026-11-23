# QA Report — VietWards V0.4.0 (Province Explorer)

## Completed in packaging environment

- Upgraded from the exact user-supplied V0.3.0 ZIP; original routes and administrative data gateway preserved.
- `npm run check:structure`: **PASS**, 31 required files and package version 0.4.0.
- `npm run check:province`: **PASS**, search normalization (diacritics, whitespace), aliases, administrative code, province/city filter and deep-link URL functions; component contracts for shared state and map/catalog links.
- Parsed all 20 TS/TSX files with global TypeScript 5.x `transpileModule` compiler diagnostics: **0 syntax diagnostics**.
- Final ZIP integrity checked via Python `zipfile.testzip()`; no `node_modules`, `.next` or secrets included.

## Not yet confirmed in this offline packaging environment

- `npm install`, `npm run check:data`, `npm run typecheck`, `npm run lint`, `npm run build`: npm registry is unreachable, `vn-local-divisions` and other application dependencies cannot be installed. The code is **not claimed production-build-verified**.
- Live external GIS gateway responses on Vercel (34 current / 63 historical) and all `matchedCount` mapping results: require connected environment testing.
- Browser/device test on real iOS/Android and PC: not performed; CSS responsive design and keyboard Escape behavior were statically reviewed only.

## Required acceptance on GitHub Actions and Vercel

1. `npm install && npm run check:structure && npm run check:data && npm run check:province && npm run typecheck && npm run lint && npm run build` succeeds.
2. Open `/ban-do?period=current&province=75` and `/ban-do?period=before&province=70`, confirm both correct period and correct region are focused and highlighted.
3. Search `dong nai`, `đồngnai`, `TPHCM`, `Sài Gòn`, `75`, and test **Tất cả / Tỉnh / Thành phố** in both catalog and map.
4. Select a province via map, confirm list selection + scroll + detail sync; select via list, confirm map selection and zoom. Repeat after navigation to `/tinh-thanh` and back.
5. Disable GIS upstream access; verify error/retry display and the catalog remains usable without fictitious geometry.
6. Check open/close mobile list bottom sheet, select via touch, info card scroll above bottom navigation, and Escape close on keyboard.
7. Check `metadata.matchedCount` / `metadata.unmatchedNames`; missing GIS boundaries must not be reported as verified.

## Scope guard

Historical merge visualization is V0.5.0; commune polygon mapping is V0.6/V0.7; verified area, population, and registration plates are V0.8.0.
