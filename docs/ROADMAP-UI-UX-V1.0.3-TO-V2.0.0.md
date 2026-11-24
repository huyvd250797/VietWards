# VietWards — UI/UX Evolution Roadmap V1.0.3 → V2.0.0

**Đã chốt:** 24/11/2026. **Baseline:** V1.0.2 — Immersive Map & Geography Challenge.  
**Nguyên tắc:** phát hành từng bước, giữ nguyên API, dữ liệu GIS, thống kê, quiz và lịch sử. PWA ưu tiên iPhone, đồng thời hỗ trợ Android và desktop. Không mặc định hoàn tất GIS cấp xã lịch sử.

| Version | Release | Phạm vi và tiêu chí nghiệm thu |
|---|---|---|
| **V1.0.3** | **Mobile UX Stabilization** | Header tinh gọn khi cuộn; giảm nội dung trước bản đồ; khóa & khôi phục scroll khi mở fullscreen, modal, picker, menu; nút Xem chi tiết luôn hiển thị; safe-area/keyboard/viewport iOS ổn định |
| V1.1.0 | Unified Design System 2.0 | Semantic colors, typography, spacing, icon, card, 2 theme, states |
| V1.2.0 | Immersive Map Experience 2.0 | Tối ưu toolbar bản đồ, highlight, zoom, fullscreen, điều khiển bằng một tay |
| V1.3.0 | Province & Ward UX 2.0 | Thống nhất tìm kiếm, chọn đơn vị, chi tiết và chuyển tỉnh ↔ xã |
| V1.4.0 | Navigation & Discovery Redesign | Tổng quan mới, tìm nhanh, tab và điều hướng |
| V1.5.0 | Historical Comparison Experience | Giao diện so sánh thời kỳ, phân màu, camera và fallback GIS |
| V1.6.0 | Geography Challenge UX 2.0 | Đề 10/20/30 câu, trạng thái làm bài, kết quả và review |
| V1.7.0 | Achievements & Learning Journey | Huân chương dựa vào câu đúng, lưu thành tích, khám phá theo chủ đề |
| V1.8.0 | Accessibility & PWA Refinement | VoiceOver/TalkBack, focus, Reduced Motion, văn bản phóng lớn và keyboard |
| V1.9.0 | Performance & Motion Optimization | Tải GIS theo yêu cầu, cache giới hạn, tốc độ render, chuyển động |
| V2.0.0 | VietWards UX Release | Hợp nhất, kiểm thử E2E/CI, sửa lỗi P0/P1, nghiệm thu thực tế |

## Tiêu chí xuyên suốt

- Bản đồ là nội dung trung tâm. Trên mobile, chạm vùng chỉ highlight; thông tin chỉ mở khi nhấn Xem chi tiết.
- Modal full-screen có header cố định; khi đóng trả đúng vị trí đã cuộn và chọn vùng.
- PWA trên iOS dùng lớp fullscreen CSS fixed khi Fullscreen API không được hỗ trợ.
- Dùng safe-area-inset cho home indicator và vùng camera; nút chạm ít nhất 44 × 44px.
- Không che thao tác bằng bottom navigation, bàn phím hay lớp đè; các lớp phủ có thứ tự z-index rõ.
- Dark/light phải tương phản; nguồn dữ liệu luôn có nhãn, không ngụy tạo ranh giới và số liệu.
- Phải đạt `typecheck`, `lint`, `build`, Playwright mobile/desktop trước khi phát hành đã nghiệm thu.

## Trạng thái thực hiện

- V1.0.3: đã triển khai code trong bản ZIP này, cần kiểm thử trực tiếp iOS PWA + Vercel trước khi xem là đã nghiệm thu thực tế.
- V1.1.0 → V2.0.0: kế hoạch, chưa triển khai.

- V1.1.0: đã triển khai source Design System 2.0, đã thêm QA cấu trúc/theme; cần nghiệm thu production build và các thiết bị thực sau deploy.
