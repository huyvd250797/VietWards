# VietWards V1.0.3 — Mobile UX Stabilization

**Baseline:** V1.0.2 `VietWards-V1.0.2-Immersive-Map-and-Geography-Challenge.zip` (đúng source VietWards do người dùng cung cấp).

## Phạm vi

1. Mobile header giảm chiều cao; thu gọn khi cuộn để ưu tiên nội dung.
2. Trang Bản đồ trên điện thoại rút gọn phần mô tả trùng lặp, đưa bản đồ lên gần đầu trang hơn.
3. Thống nhất cơ chế khóa cuộn cho fullscreen, modal chi tiết, danh sách và drawer, dùng reference count để giữ nguyên vị trí cuộn khi đóng overlay lồng nhau trên iOS.
4. MapLibre resize theo ResizeObserver, thay đổi viewport, orientation, và visualViewport của iPhone; không dựng lại instance khi fullscreen.
5. Fullscreen dạng CSS fixed cho iPhone PWA; giữ các nút zoom, danh sách và Xem chi tiết trong màn hình; xử lý safe-area top/bottom/side.
6. Modal chi tiết cấp tỉnh & cấp xã giữ tiêu đề sticky, chiều cao theo visual viewport, focus trap, Esc, nút quay lại bản đồ mà không gây nhảy cuộn.
7. Menu mobile có focus trap, Esc, scroll nội bộ và an toàn vùng màn hình.
8. Cập nhật PWA cache, metadata phiên bản, kiểm thử CI và kịch bản Playwright.
9. Chốt roadmap UI/UX V1.0.3→V2.0.0 ở `docs/ROADMAP-UI-UX-V1.0.3-TO-V2.0.0.md` và trên trang Giới thiệu của ứng dụng.

## Thay đổi bảo toàn

- Không thay đổi GeoJSON, API hành chính, thống kê, biển số, quan hệ lịch sử, logic thử thách và thành tích.
- Không yêu cầu cấu hình environment hay SQL migration mới.
- Không tuyên bố dữ liệu GIS cấp xã lịch sử (0/63 tỉnh) đã được xác minh.

## Hướng dẫn nghiệm thu trực tiếp trên PWA iPhone

1. Mở `/ban-do`, vuốt trang: header thu gọn và không nhảy vị trí.
2. Chọn tỉnh, nút **Xem chi tiết** luôn nằm ngay trên bản đồ, không cần cuộn xuống để tìm.
3. Mở fullscreen, kéo/zoom hai ngón, dùng Chọn tỉnh; mở Chi tiết, rồi đóng: trở lại đúng vùng bản đồ.
4. Thu gọn fullscreen: trang trở về đúng vị trí đã cuộn trước đó.
5. Mở menu chính / danh sách / modal, thử cuộn: không cuộn trang bên dưới.
6. Xoay máy, thay đổi chiều cao cửa sổ, hiện bàn phím tìm kiếm: điều khiển không bị che bởi thanh Home Indicator hoặc notch.
7. Kiểm tra Dark Mode và tab bar không đè nội dung hoặc nút.
8. Hoàn thành thử thách 10/20/30 câu, kiểm tra huân chương và nguồn dữ liệu không thay đổi.

## Giới hạn kiểm chứng

Build Next.js, ESLint, TypeScript semantic, Playwright E2E ứng dụng thật và deployment Vercel chưa thể chạy trong môi trường đóng gói vì npm registry DNS `EAI_AGAIN`; cần chạy trên GitHub Actions/Vercel. Chromium kiểm tra CSS độc lập **không** thay thế test PWA iOS thật.
