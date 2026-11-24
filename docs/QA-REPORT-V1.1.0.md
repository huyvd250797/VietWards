# QA — VietWards V1.1.0

## Trạng thái kiểm tra khi đóng gói

Báo cáo phân biệt rõ kiểm tra mã nguồn và kiểm tra trên ứng dụng chạy thật. Không coi kiểm tra CSS/tokens là tương đương thao tác trên iPhone.

| Kiểm tra | Trạng thái |
|---|---|
| Nguồn ZIP đúng baseline V1.0.3 | Đạt |
| Semantic color tokens ở Light/Dark và tương phản >= 4.5:1 cho các cặp chữ chuẩn | **Đạt**: 18 vai trò màu/theme; 18/18 cặp tương phản WCAG từ 5.0:1 trở lên |
| Cấu trúc source và metadata V1.1.0 | **Đạt**: `check:structure`, `check:release` |
| Logic dữ liệu hành chính/GIS/quiz | **Đạt**: search, history, communes, legacy, verified, education, quiz, mobile & release tests chạy độc lập |
| Kiểm tra TypeScript không có dependency | **Đạt**: transpileModule 47 tệp TS/TSX, không có lỗi cú pháp (không thay typecheck ngữ nghĩa) |
| Typecheck, ESLint, Next.js build | **Chưa đạt điều kiện chạy**: `next` / `eslint` không cài; `tsc` thiếu `@playwright/test` và các dependency khác; npm registry trả `EAI_AGAIN` |
| Playwright browser E2E | **Chưa chạy**: không có Playwright test dependency và Chromium browser |
| PWA trên iPhone, Android và deployment Vercel | Chưa nghiệm thu thực tế |

**Các stylesheet:** parse thành công cả 4 CSS (Design Tokens, Design System, Globals, Educational). Các kết quả này là kiểm thử cấu trúc, chưa là xác nhận ứng dụng đã chạy thực tế.

## Các kịch bản QA thủ công cần kiểm tra sau khi deploy

1. iPhone PWA, sáng/tối: thanh điều hướng, icon, modal chi tiết tỉnh, số dân, diện tích, biển số đều dễ đọc.
2. Chọn một tỉnh rồi bật fullscreen; đóng chi tiết không mất camera hoặc selected region.
3. Màn cấp xã tìm không dấu, bottom sheet và nguồn dữ liệu có tương phản tốt.
4. Học địa lý, tab so sánh Đồng Nai/TP.HCM và quiz 10/20/30 câu: màu, nút disabled/focus, đáp án, huân chương.
5. PC Light/Dark: nav active, search, period toggle, cards và bảng thống kê rõ ràng.
6. Chuyển theme liên tục, reload, quay lại app offline: không hiện text tối trên nền tối.
7. Vercel: build, typecheck và console runtime không có lỗi mới.

Giới hạn GIS lịch sử cấp xã không thay đổi ở bản này; không tự tạo dữ liệu chưa xác minh.
