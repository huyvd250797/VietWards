# VietWards V1.0.0 — Public Release

Release baseline: **V0.9.0 Educational Experience & QA**, user-supplied source ZIP dated 23 November 2026.

## Delivered

- All V0.9.0 functions retained: GIS provincial map/commune explorer, administrative historical atlas, sourced provincial statistics and plates, learning quizzes and comparison.
- Application/PWA/ZIP version updated to **V1.0.0**; ten roadmap milestones corrected, with V0.7.0 marked as *partially complete* due to unavailable verified legacy commune polygons.
- Added `/trang-thai`, `/api/health`, manual remote GIS availability probe, and truthful 0/63 legacy GIS disclosure. The health endpoint returns HTTP 503 when local catalog/statistical invariants fail, but does **not** probe upstream GIS without user action.
- Added PWA installation guidance, non-destructive user-confirmed SW update process, offline warning, versioned fallback resources, and app-only cache cleanup. Administrative API data is not stored indefinitely by the worker.
- Added route-level error recovery, customized 404, loading state, skip link and mobile status page.
- Added standalone public-release quality checks and Playwright smoke scenarios; CI checks release integrity.

## Deferred until trusted sources are available

1. Accurate, fully licensed and verified historic commune-level GIS for all 63 provinces (currently **0/63 shipped**).
2. Complete verified commune-level population and area dataset.
3. Independent legal geometry certification and upstream availability assurance.

## Required post-deploy actions

1. GitHub Actions: `check:*`, TypeScript, ESLint, production build, and Playwright browser smoke must all pass. Review the actual workflow output, not just these source assertions.
2. Vercel: open the site on desktop, iPhone and Android; check 34/63 GIS and current commune layers from `/trang-thai`.
3. Confirm app installs on compatible browsers, offline fallback loads only when offline, and worker update prompt does not discard an active quiz.
4. Review licensing and attribution of every third-party GIS source before public promotion. Preserve all provenance warnings.

No SQL migration is needed. No backend database is introduced.
