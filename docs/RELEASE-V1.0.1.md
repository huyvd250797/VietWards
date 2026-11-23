# VietWards V1.0.1 — Mobile Map UX & Contrast Polish

## Các thay đổi
- **Map-first trên điện thoại:** chạm tỉnh/thành hoặc xã/phường chỉ làm nổi vùng GIS. Bỏ bảng bottom sheet auto-open che bản đồ.
- **CTA rõ ràng:** dải lựa chọn gọn dưới bản đồ, có tên địa phương, nút **Xem chi tiết** và **Bỏ chọn**. Dải nằm bên dưới canvas nên không che polygon.
- **Modal full screen:** header ghi tên địa phương, có nút đóng, hỗ trợ Escape và khóa scroll nền, cuộn thông tin độc lập, vùng an toàn iOS/Android. Có nút **Xem xã/phường trên bản đồ** ở đầu modal cấp tỉnh hiện hành.
- **Đồng nhất cấp xã:** sử dụng cùng cơ chế chọn trên bản đồ và mở modal tại xã/phường/đặc khu.
- **Contrast:** các màu chữ diện tích/dân số/mật độ, chú thích và biển số chuyển theo Design System của Light/Dark Mode, tăng cỡ số và độ tương phản.
- **Khả năng truy cập:** nút chạm >= 44px, Escape, quản lý focus quay về nút mở, giới hạn Tab trong dialog và khóa cuộn nền.
- **Không thay đổi dữ liệu:** giữ nguyên thống kê 97 tỉnh theo hai snapshot, biển số, nguồn và GIS tham khảo, không có migration.

## Giới hạn
Không thêm ranh giới cấp xã lịch sử được xác minh; hạn chế GIS V1.0.0 vẫn còn. Build production/kiểm thử Vercel phải được kiểm chứng độc lập.

## QA
Xem `docs/QA-REPORT-V1.0.1.md` và chạy `npm run check:uiux`; CI thực hiện thêm semantic typecheck, ESLint, production build, browser smoke.
