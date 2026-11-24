# QA Report — VietWards V1.0.2

## Đã chạy và đạt

- `node scripts/check.mjs`
- `node scripts/verify-public-release.mjs`
- `node scripts/verify-quality-gates.mjs`
- `node scripts/verify-verified-stats.mjs`
- `node --experimental-strip-types scripts/verify-education.mjs`
- `node --experimental-strip-types scripts/verify-challenge-v102.mjs`
- `node scripts/verify-mobile-map-ux.mjs`
- `node --experimental-strip-types scripts/verify-historical-selection.mjs`
- `node --experimental-strip-types scripts/verify-province-explorer.mjs`
- `node --experimental-strip-types scripts/verify-commune-explorer.mjs`
- `node --experimental-strip-types scripts/verify-legacy-atlas.mjs`
- Global TypeScript compiler: `tsc --noEmit --strict --target ES2022 --module esnext --lib es2022,dom src/lib/education-model.ts` — đạt.
- TypeScript transpile syntax check riêng trên các tệp TS/TSX — đạt.

## Chưa xác nhận

- Full project `npm run typecheck`, `npm run lint`, `npm run build`, Playwright E2E, iPhone Safari PWA/Vercel runtime. `npm install` bị `EAI_AGAIN` khi kết nối npm registry.
- QA kích thước giao diện bằng Chromium CLI chưa hoàn tất do trình duyệt bị timeout; không xem đây là kiểm thử browser đã đạt.

## Kịch bản cần chạy sau deploy

1. iPhone PWA: chạm chữ, input, nút — **không zoom toàn trang**; di chuyển và pinch map vẫn phóng to bản đồ.
2. Chọn tỉnh Đồng Nai ở cấp tỉnh: vùng highlight đúng, nút Xem chi tiết ngay trong map, không cần cuộn.
3. Bấm nút fullscreen: không thấy navigation/footer; bản đồ dùng hết diện tích hữu dụng, CTA vẫn nhìn thấy.
4. Mở danh sách địa phương từ fullscreen: danh sách phải nổi phía trên map và chọn được.
5. Mở chi tiết, đóng, mở xã/phường, vào fullscreen cấp xã, chọn xã, quay lại cấp tỉnh.
6. Đổi kỳ khi đang xem địa phương, đảm bảo không mất dữ liệu/không hiển thị xã cũ như hiện hành.
7. Ra đề 10/20/30 hai lần liên tiếp: đáp án được chấm đúng, đề mới thay đổi; hoàn thành và nhận huân chương đúng tỷ lệ.
8. Đóng PWA mở lại: thành tích cũ còn trên cùng thiết bị, không có bảng xếp hạng/đồng bộ chéo thiết bị.
9. Dark Mode và Light Mode: nút, chữ, modal và bản đồ không bị chìm màu.
10. Run CI trên GitHub: lint, Next build, Playwright; không công bố đạt nếu chưa có kết quả.

## Dữ liệu chưa hoàn thiện

GIS ranh giới cấp xã trước ngày 01/07/2025 chưa có polygon được kiểm chứng và đóng gói (0/63 tỉnh). Chỉ cho phép tra cứu lịch sử có nguồn; phần hình học chưa hoàn thành vẫn là backlog riêng.
