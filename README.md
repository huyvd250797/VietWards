> **VietWards V1.1.2 — Roadmap Status Type Safety Fix**. Sửa TS2367 dòng 38 ở UX roadmap bằng typed state mapping, rà soát trạng thái hai roadmap và bổ sung CI regression tests. Xem `docs/RELEASE-V1.1.2.md` và `docs/QA-REPORT-V1.1.2.md`.

> **VietWards V1.1.1 — Roadmap Typecheck Hotfix**. Sửa lỗi deploy `TS2367` ở các mốc roadmap nền tảng; không thay đổi chức năng. Xem `docs/RELEASE-V1.1.1.md` và `docs/QA-REPORT-V1.1.1.md`.

> **VietWards V1.1.0 — Unified Design System 2.0.** Cấu trúc token: `src/app/design-tokens.css`; các override giao diện: `src/app/design-system.css`; tài liệu: `docs/DESIGN-SYSTEM-V2.0.md`.

# VietWards V1.0.1 — Mobile Map UX & Contrast Polish

**VietWards** is a responsive Vietnamese educational administrative geography PWA. Built on Next.js App Router, React 19, TypeScript, MapLibre GL JS and `vn-local-divisions`. Deployed on Vercel, the app requires no localhost or login for end users.

## What's new in V1.0.1

- Selecting a province or commune on mobile **only highlights the geographic area**; the information sheet no longer covers the map.
- An explicit **Xem chi tiết** action opens a **full-screen details modal** with the locality name in its sticky header, a close button, accessible focus handling, and iOS safe-area spacing.
- The province modal includes **Xem xã/phường trên bản đồ**, or **Tra cứu xã/phường cũ** for the historical period.
- Area, population, density, source information, and vehicle plate codes use contrast-safe dark/light theme tokens and enlarged numerals.
- The existing PC layout, PWA, GIS services and provenance metadata remain intact; this release changes UI/UX, not the underlying administrative statistics.

## Features preserved from V0.9.0

- Two administrative snapshots: **63 provinces before 01/07/2025; 34 provinces now**, searchable by code or Vietnamese names.
- Interactive provincial GIS, highlighted selected region and dimmed others, 1/2/3-province historic split/merge, responsive province list, and shareable URLs.
- Current commune/ward GIS requested **only for the selected province**, plus the historical three-level province/district/commune catalog, with partial-transfer and source-provenance warnings.
- Provincial **area, population (with reference date/type), density, and license plate prefixes**, with primary-source references; 97 province statistics entries across two snapshots.
- `/hoc-dia-ly`: guided learning, two-province map comparison (defaults to Đồng Nai and TP. Hồ Chí Minh), interactive map/plate quiz, and data transparency.

## Previous V1.0.0 release scope

1. **Public release metadata:** version 1.0.0 across the app, PWA and source; ten roadmap milestones corrected (V0.8.0 no longer mislabeled V0.9.0). The historic commune GIS part of V0.7.0 is explicitly **partial**, not complete.
2. **System/data diagnostics:** `/trang-thai` and `/api/health` show the actual count of province catalogs and statistical entries, historical verified geometry coverage, data snapshot dates, and current limitations. Users may manually check external provincial GIS readiness; this is not a legal accuracy certification.
3. **Reliable PWA lifecycle:** safe versioned offline fallback, app-owned cache cleanup only, offline connection warning, and user-confirmed worker update (no abrupt session reload). Basic install guidance in About for Safari iOS and supported desktop/Android browsers.
4. **Recovery UX:** custom route error recovery, loading, friendly 404, focusable skip-to-content link, status link in app navigation/footer, and mobile-friendly diagnostics.
5. **Release quality gates:** independent `npm run check:release` verifying version, roadmap, provenance limitations and PWA contracts; additional Playwright status/mobile/404 smoke tests; CI includes public-release gate.

## Deploy on Vercel

1. Push the **contents** of this ZIP into the root of the VietWards GitHub repository.
2. Import the repository in Vercel, framework **Next.js**, Node.js **22.x**. Leave the default root directory and build (`npm run build`).
3. After deployment, verify `/`, `/ban-do`, `/tinh-thanh`, `/lich-su`, `/hoc-dia-ly`, `/gioi-thieu` and `/trang-thai`. Then run manual GIS checks from `/trang-thai`, plus real-world touch interactions on PC and mobile.
4. Verify the CI workflow (`.github/workflows/ci.yml`) and Vercel build logs before considering the release production-accepted. No account, DB, SQL migration, or environment variables are required for the app's documented core functionality.

### Quality checks

```bash
npm install
npm run check:structure
npm run check:data
npm run check:province
npm run check:history
npm run check:communes
npm run check:legacy
npm run check:verified
npm run check:education
npm run check:qa
npm run check:release
npm run check:uiux
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run check:gis:online` verifies live upstream GIS separately; run it only where internet is available. The tests use synthetic fixture geometries solely to test UI interactions, **not to establish geographical accuracy**.

## Read before publication

- **Legacy commune GIS: 0/63 provincial datasets with verified polygon provenance bundled.** The catalog and succession relationships exist but interactive historical commune polygons cannot be claimed complete. The app never draws fictitious boundaries to hide this gap.
- **Current and legacy provincial GIS** and current commune GIS come from external third-party sources; availability, geographic accuracy, and reuse rights need independent review. Do not present them as legally certified cadastral boundaries.
- Provincial population and area reference years vary. Merged 2025 provinces use administrative-scale populations; unchanged ones use 2024 statistical-average values. No live 2026 census values are inferred. Commune area and population are not comprehensively verified.
- A healthy `/api/health` does **not** test external GIS by default and is not evidence of successful Vercel production build, security review, or independent legal validation.

See `docs/RELEASE-V1.0.1.md`, `docs/QA-REPORT-V1.0.1.md`, `docs/RELEASE-V1.0.0.md`, `docs/QA-REPORT-V1.0.0.md`, `docs/VERIFIED-STATISTICS-PROVENANCE.md`, and `THIRD_PARTY_NOTICES.md`.

## VietWards V1.0.2 — Immersive Map & Geography Challenge

- Mobile/PWA: chặn zoom toàn giao diện (giữ zoom MapLibre), mở bản đồ fullscreen ở cả cấp tỉnh/xã, thanh **Xem chi tiết** nằm ngay trong bản đồ. Fullscreen phù hợp PWA iPhone và safe area, danh sách chọn địa phương luôn nổi đúng lớp.
- Học địa lý: ngân hàng câu hỏi sinh từ dữ liệu thực, đề ngẫu nhiên **10/20/30 câu**, không lặp trong một đề, chấm theo % đúng, **Đồng/Bạc/Vàng/Kim cương**, thành tích lưu localStorage và xem lại bài làm.
- QA: `npm run check:challenge` cùng các kiểm thử cũ. Xem `docs/RELEASE-V1.0.2.md` và `docs/QA-REPORT-V1.0.2.md` để biết giới hạn dữ liệu và trạng thái kiểm thử.


### Lộ trình nâng cấp UI/UX

Roadmap V1.0.3 đến V2.0.0 đã được chốt trong [`docs/ROADMAP-UI-UX-V1.0.3-TO-V2.0.0.md`](docs/ROADMAP-UI-UX-V1.0.3-TO-V2.0.0.md). V1.0.3 ổn định trải nghiệm iPhone; V1.1.0 bổ sung Design System 2.0 với tokens semantic, typography, card, nút, modal và Light/Dark Mode.
