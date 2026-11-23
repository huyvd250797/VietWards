# QA Report — VietWards V1.0.0

Date: 23 November 2026. Baseline: uploaded VietWards V0.9.0 ZIP.

| Gate | Assessment | Evidence/limitations |
|---|---|---|
| Archive/source inspection | VERIFIED | ZIP source opened and checked. |
| Roadmap/version consistency | CHECKED LOCALLY | Ten unique milestones; one V0.8.0, one V0.9.0, current V1.0.0. |
| Statistics provenance | CHECKED LOCALLY | 63 historic + 34 current source records, type/period warnings retained. |
| Verified legacy commune GIS coverage | **INCOMPLETE** | 0/63 province files included in signed-source manifest; no invented polygons. |
| PWA lifecycle / offline fallback | STATIC CHECK ONLY | New worker uses app-cache scoping, explicit user-controlled updates; browser lifecycle untested. |
| Runtime diagnostics | STATIC CHECK ONLY | `/api/health` checks local counts and returns 503 for broken local invariants; remote GIS is a separate manual probe. |
| Browser error and 404 screens | STATIC CHECK ONLY | Error, loading and not-found components added; Playwright smoke tests provided. |
| Node pure logic/test contracts | PASS | `check:province`, `check:history`, `check:communes`, `check:legacy`, `check:verified`, `check:education`, `check:qa`, `check:release`, `check:structure`. |
| TypeScript semantic check | NOT VERIFIED | Dependencies not available for this environment. |
| ESLint and Next.js production build | NOT VERIFIED | `npm run build` was attempted: `next: not found` (exit 127); npm dependencies unavailable and npm registry DNS unreachable. |
| Browser smoke and Vercel deployment | NOT VERIFIED | Deploy repository and inspect CI/Vercel logs before calling it production accepted. |
| Live GIS and license verification | NOT VERIFIED | Requires external network and rights documentation. |

**Release designation:** Source V1.0.0 — Public Release *candidate*. Do not state that Vercel runtime, legal GIS completeness or public deployment was verified without production evidence.
