# VietWards V1.1.0 — Unified Design System 2.0

Source baseline: `VietWards-V1.0.3-Mobile-UX-Stabilization(1).zip`.

## Thay đổi

1. Tách hệ semantic token chung vào `src/app/design-tokens.css` (Light/Dark + compatibility alias cho CSS cũ).
2. Nạp `src/app/design-system.css` sau globals và educational để thống nhất typography, cards, tabs, điều hướng, nút, icon button, modal, bảng thống kê và biển số.
3. Thiết kế riêng màu hành động đặc và màu link, bảo đảm chữ trắng trên nền button Dark Mode không bị chìm.
4. Duy trì toàn bộ thao tác bản đồ, fullscreen, bottom action bar, iPhone safe-area, modal focus trap, dữ liệu hành chính, API, quiz 10/20/30 câu và huân chương.
5. Bổ sung `check:design-system` kiểm tra WCAG màu cơ bản và `e2e/design-system.spec.ts` kiểm tra Light/Dark và viewport mobile.
6. Đồng bộ branding, roadmap, service worker version, CI.

## Cách kiểm tra

`npm install --no-audit --no-fund`
`npm run check:design-system`
`npm run check:mobile-stability`
`npm run check:uiux`
`npm run typecheck`
`npm run lint`
`npm run build`
`npm run test:e2e`

## Phạm vi không thay đổi

Không có migration SQL. Không thay đổi ranh giới GIS, mã hành chính, giá trị dân số, biển số xe hoặc thuật toán quiz. GIS cấp xã trước sáp nhập vẫn chưa có polygon toàn quốc đã kiểm chứng. Cần kiểm thử chạy thực tế trên Vercel/PWA trước khi nghiệm thu production.
