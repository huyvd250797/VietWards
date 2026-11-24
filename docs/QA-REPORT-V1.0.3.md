# QA — VietWards V1.0.3 Mobile UX Stabilization

## Đã chạy thành công trong môi trường đóng gói

- `npm run check:structure`: PASS.
- `npm run check:uiux`: PASS.
- `npm run check:mobile-stability`: PASS.
- `npm run check:release`: PASS; 10 mốc roadmap nền, 11 mốc UI/UX, 97 bản ghi tỉnh có thống kê.
- `npm run check:qa`: PASS.
- `npm run check:verified`: PASS, 63 tỉnh cũ / 34 tỉnh hiện hành.
- `npm run check:education`: PASS.
- `npm run check:challenge`: PASS; 218 câu hiện hành / 334 câu lịch sử, đề ngẫu nhiên 10/20/30 và ngưỡng huân chương.
- `npm run check:province`, `check:history`, `check:communes`, `check:legacy`: PASS.
- Transpile cú pháp TypeScript/TSX với TypeScript toàn cục: PASS; không có lỗi cú pháp.
- Kiểm tra CSS trong Chromium độc lập, kích thước 390 × 844: `scrollWidth=390`, bản đồ hiển thị 549px chiều cao; CTA chi tiết ở y=636→710, trên tab bar y=778; fullscreen bản đồ 390 × 844, modal 390 × 844, header rút còn 52px sau transition. **Đây là fixture CSS, không phải Next.js runtime.**

## Chưa thể chạy / chưa xác minh

- `npm install`: FAIL do DNS `EAI_AGAIN` đến `registry.npmjs.org`.
- `npm run check:data`: chưa chạy được do thiếu `vn-local-divisions` (là dependency từ npm); phần bất biến liên quan được kiểm tra qua các script độc lập còn lại.
- `npm run typecheck`, `npm run lint`, `npm run build`: chưa chạy được do thiếu dependencies.
- `npm run test:e2e`: đã thêm bài kiểm thử iPhone-style cho compact header, scroll restore, picker, modal và Escape; chưa chạy được trên app thực.
- PWA standalone trên iPhone, keyboard/safe area thực và Vercel: chưa xác nhận.
- GIS cấp xã trước sáp nhập (cũ): 0/63 tỉnh có polygon được xác minh trong ZIP, chưa thay đổi.

## Nguyên tắc phát hành

Bản ZIP chỉ được coi là **source nâng cấp**, không được coi là production verified. Phải chờ GitHub Actions hoặc Vercel build/typecheck/lint/E2E đạt và kiểm tra trên iPhone trước khi nghiệm thu triển khai.
