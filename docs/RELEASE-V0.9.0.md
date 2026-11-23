# V0.9.0 — Educational Experience & QA

**Date:** 2026-11-23. **Source:** user's attached `VietWards-V0.8.0-Verified-Statistics-and-Plates(1).zip`.

## Added

- `/hoc-dia-ly` learning page, represented in desktop navigation, mobile bottom navigation, PWA shell and home page quick links.
- Default map + statistics comparison: Đồng Nai (code 75) vs TP. Hồ Chí Minh (code 79), with two distinguishable highlight colors, dimming of other provinces (57%), fit-bounds camera and responsive table.
- Switching A/B through select lists or clicking the map with a chosen slot, URL-based sharing, source-linked statistics and historical predecessor links.
- Province comparison safeguards: population differences only for the same kind and period; area differences only for the same reference date; density comparison only if both safeguards pass.
- Five-step educational explorer (location, area, population, provincial vehicle prefix, pre-merger history).
- Self-contained quiz (plate 93, current Đồng Nai predecessor group, compatible area comparison and map selection) with alternative accessible buttons, explanations, source ids and local-only best result.
- Data trust dashboard with coverage and explicit GIS limitations.
- `scripts/verify-education.mjs`, `scripts/verify-quality-gates.mjs`, and Playwright UI smoke tests wired into GitHub CI.

## Retained

- All V0.8.0 administrative catalog, province and commune map routes, legacy relations, historical map transitions, source URLs and source attribution.
- No data or GIS polygons added that were not sourced; no change to schema and no SQL migrations.

## Known limits

- No national verified pre-merger commune GIS (0/63), and no comprehensive verified per-commune population/area records. Not solved in V0.9.0.
- External GIS availability and accuracy depend on the upstream service; these are cartographic references and may be unavailable, incomplete or restricted for reuse.
- Side-by-side **historical** map camera synchronization and swipe split-view are not included; the existing historical period switch and split/merge view remain available from the History page.
- The `@playwright/test` suite runs in CI or on a dev environment with packages/browser installed; not a statement that CI has already passed on a remote repository.
- Full production validation, lighthouse/accessibility audits, and real Vercel deployment must be completed before claiming V1.0.0 readiness.
