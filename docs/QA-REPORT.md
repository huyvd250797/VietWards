# QA Report — VietAtlas V0.1.0

## Checks completed in release workspace

- PASS: Required route/source/asset structure: `node scripts/check.mjs`.
- PASS: Parse/transpile syntax of all 14 authored TypeScript/TSX source/config modules using installed TypeScript compiler.
- PASS: Resolve all local `@/` imports to existing source modules.
- PASS: JavaScript syntax check for `public/sw.js` and `eslint.config.mjs` (`node --check`).
- PASS: Generated PWA icon assets (192px, 512px, maskable 512px, apple touch 180px).
- PASS: README, roadmap and Vercel deployment settings included.

## Checks not completed / deployment caveats

- NOT RUN: `npm install`, because the current workspace cannot resolve `registry.npmjs.org` (DNS EAI_AGAIN).
- NOT RUN: full `next build`, `tsc --noEmit`, `eslint .`, real browser QA for Next application; these require dependencies to be installed.
- NOT DONE: connecting a GitHub repository to the user's Vercel account or deploying a public Vercel URL. These are account-specific actions.
- NOT IMPLEMENTED BY DESIGN: administrative GIS, polygon selection, real province search, statistics and license plate lookup (deferred by roadmap).

## Recommended Vercel verification

1. Deploy with Next.js preset, Node 22.x.
2. Verify all 5 routes render and navigation works.
3. Check mobile at 390px width and desktop at 1440px width.
4. Switch theme and period, navigate and reload; confirm preferences persist.
5. Check `/manifest.webmanifest`, `/sw.js` and icon URLs return 200 over HTTPS.
6. Install PWA, switch offline and verify fallback `offline.html` appears rather than stale administrative data.
7. Review Vercel logs and GitHub Actions typecheck/lint/build results before declaring production build validated.
