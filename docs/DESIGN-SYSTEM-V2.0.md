# VietWards — Unified Design System 2.0 (V1.1.0)

## Phạm vi & nguyên tắc

Tất cả các thành phần ứng dụng (không phải nội dung hình học GIS) lấy màu từ hệ token semantic, không dùng màu cố định cho chữ trên các nền thay đổi theo Light/Dark Mode. Bộ token gốc nằm trong `src/app/design-tokens.css` và lớp giao diện dùng chung nằm trong `src/app/design-system.css`, được nạp sau các CSS trước đó.

**Không đổi chức năng**: dữ liệu hành chính, GeoJSON, mốc sáp nhập, tra cứu xã/phường, thử thách ngẫu nhiên, huân chương, trình điều khiển MapLibre, modal fullscreen, ngăn scroll iOS và Service Worker vẫn sử dụng logic hiện có.

## Token chuẩn

| Nhóm | Ví dụ | Dùng cho |
|---|---|---|
| Background / surfaces | `--vw-bg`, `--vw-surface`, `--vw-surface-subtle`, `--vw-surface-muted` | Trang, card, danh sách, bottom sheet |
| Text | `--vw-fg`, `--vw-fg-secondary`, `--vw-fg-muted` | Tiêu đề, số liệu, mô tả, nhãn |
| Brand / interactive | `--vw-accent`, `--vw-accent-tint`, `--vw-accent-tint-fg` | Link, nhãn active, tab |
| Primary action | `--vw-action`, `--vw-action-hover`, `--vw-on-action` | Nút hành động có nền đặc; **khác** màu chữ link khi ở dark mode |
| States | `--vw-success`, `--vw-warning`, `--vw-danger` + tint | Dữ liệu xác thực, lưu ý, lỗi |
| Structure | `--vw-border`, `--vw-border-strong`, `--vw-radius-*`, `--vw-shadow-*` | Viền, bo góc, độ nổi |
| Accessibility | `--vw-focus`, `--vw-motion-*` | Focus, transition, reduced motion |
| Typography | `--vw-text-*`, `--vw-font-*` | Phân cấp chữ mới |
| Spacing | `--vw-space-*` | Nhịp bố cục |

Các alias `--bg`, `--surface`, `--text`, `--blue`, `--line` vẫn tồn tại để không phá các component cũ. Khi phát triển thêm, ưu tiên token `--vw-*`.

## Reusable classes

- `vw-card`, `vw-card-subtle`: card sáng/tối tương thích.
- `vw-button`, `vw-button-primary`, `vw-button-quiet`: button tối thiểu 44px cho mobile.
- `vw-icon-button`: nút biểu tượng 44px với focus rõ.
- `vw-badge`: nhãn semantic nền nhạt, chữ đậm.
- `vw-field`: form field có trạng thái focus.
- `vw-stat-card`: số liệu dạng tabular.

Đã ứng dụng cho khung app, menu, header, bottom navigation, nút icon, chế độ thời kỳ, danh sách tỉnh, chi tiết bản đồ, thống kê và biển số, các tab Học địa lý, bảng so sánh và thử thách.

## Dark Mode

Dark Mode sử dụng nền xanh đậm (`#122238`) với chữ sáng (`#eff6ff`) và nhãn phụ (`#c5d5e8`); action đặc dùng `--vw-action: #2c67d7` với chữ trắng, **không** dùng màu `--vw-accent: #9ac0ff` làm nền button trắng chữ trên đó. Các điều khiển MapLibre nằm trên nền bản đồ sáng sử dụng nền trắng và chữ sẫm có chủ đích ở cả hai mode.

## Accessible UI

- Tương phản cơ bản: chữ >=4.5:1, chữ lớn >=3:1 (kiểm tra ở cả hai bộ token).
- Icon button / nút bấm quan trọng trên mobile >=44px.
- Keyboard focus ring 3px và prefers-reduced-motion.
- Không bỏ khóa cuộn hoặc safe-area đã triển khai ở V1.0.3.
- Bộ chọn xã/phường, lọc loại, biển số và đối chiếu dữ liệu vẫn giữ nguyên mốc thông tin.
- Chống zoom khi focus input iPhone bằng 16px trên các trường tương tác; việc giới hạn pinch-zoom trang từ V1.0.2 sẽ được xem xét lại tại V1.8.0 (Accessibility & PWA Refinement).

## Quy trình QA

`npm run check:design-system`, `npm run check:mobile-stability`, `npm run check:uiux`, `npm run check:verified`, `npm run check:challenge`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`.

QA cấu trúc/theme không thay thế bài kiểm tra mắt nhìn trên iPhone PWA, Android và desktop ở hai chế độ sáng/tối. Tính hợp lệ nguồn GIS lịch sử (0/63 tỉnh đã kiểm chứng cấp xã cũ) là giới hạn dữ liệu độc lập, không thay đổi ở V1.1.0.
