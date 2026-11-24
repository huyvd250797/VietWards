# VietWards V1.0.2 — Immersive Map & Geography Challenge

Nâng cấp trực tiếp từ V1.0.1. Bản này **không** thay đổi dữ liệu Master hành chính, số liệu dân số, biển số xe hay nguồn ranh giới GIS.

## 1. Bản đồ mobile / PWA

- Ngăn **zoom toàn bộ trang** do pinch/double-tap và tự zoom khi focus input trên iPhone: Next viewport `maximumScale: 1`, `userScalable: false`; CSS font-size tối thiểu 16px cho input mobile, `touch-action: manipulation` trên control.
- Vẫn cho phép **pan / pinch zoom trực tiếp bên trong bản đồ MapLibre**, không khóa zoom bản đồ.
- Nút **Mở bản đồ toàn màn hình** nằm trong cụm điều khiển bản đồ tỉnh và xã. Dùng fixed CSS overlay thay cho Fullscreen API vốn hỗ trợ không đồng đều trên PWA iOS.
- Fullscreen có header tên địa phương, nút Thu gọn, nút zoom, danh sách địa phương và thanh thông tin vùng đã chọn.
- **Xem chi tiết** bây giờ là thanh thao tác ở ngay đáy bản đồ, không nằm bên dưới khiến người dùng phải cuộn trang. Chọn vùng vẫn không tự bật modal.
- Modal chi tiết toàn màn hình tiếp tục hoạt động; khi đóng modal, trở lại bản đồ đang xem và không mất lựa chọn.
- Safe-area cho Dynamic Island/home indicator; khóa cuộn trang khi fullscreen, MapLibre resize khi thay đổi diện tích, danh sách chọn nằm cao hơn lớp fullscreen.

> Giới hạn khả năng truy cập: chế độ chặn zoom trang được thực hiện theo yêu cầu sử dụng PWA như app gốc, nhưng đồng thời hạn chế khả năng phóng to văn bản bằng pinch của người dùng khiếm thị. Trong tương lai có thể cung cấp một tùy chọn “Cho phép phóng to giao diện”.

## 2. Ngân hàng câu hỏi địa lý & huân chương

- Tự sinh ngân hàng câu hỏi với mã tỉnh, biển số duy nhất theo từng thời kỳ, vị trí trên GIS, quan hệ sáp nhập, diện tích và dân số **chỉ khi cùng loại/kỳ**, số đơn vị hành chính cấp xã.
- Có lựa chọn đề **10 / 20 / 30 câu**. Đề trộn bằng Fisher-Yates; không lặp ID câu trong cùng đề; tránh tạo lại đúng thứ tự đề vừa làm.
- Mỗi câu 1 điểm; đáp án và giải thích theo dữ liệu nguồn. Câu hỏi bản đồ có nút đáp án thay thế nếu GIS không tải được.
- Thành tích tính theo **tỷ lệ đúng**, không chỉ số lần thi: <60% không huân chương; 60–79% Đồng; 80–89% Bạc; 90–99% Vàng; 100% Kim cương.
- Thành tích lưu **localStorage trên thiết bị**, phân biệt kỳ hiện tại/lịch sử và độ dài đề. Không có đăng nhập, đồng bộ chéo thiết bị hoặc xếp hạng giả.
- Xem lại câu đúng/sai, đáp án đã chọn và lời giải sau khi hoàn thành.

## 3. Kiểm thử và giới hạn

- Chạy các bài kiểm tra Node về dữ liệu, sáp nhập, địa giới cấp xã, thống kê, QA và PWA.
- Kiểm tra ngân hàng câu hỏi từ 97 bản ghi thống kê cấp tỉnh: 218 câu hiện hành, 334 câu lịch sử trong dữ liệu thử nghiệm tương ứng; 10/20/30 câu không trùng, điểm huân chương đúng ở 15 ranh giới.
- Kiểm tra cú pháp TypeScript/TSX và typecheck độc lập của module tạo đề.
- **Chưa xác minh** build Next.js, ESLint, E2E Playwright và chạy trực tiếp iPhone/Vercel vì không tải được dependencies từ npm registry trong môi trường này.
- GIS cấp xã lịch sử xác minh vẫn **0/63 tỉnh**, không tạo ranh giới thay thế.

## 4. Triển khai

Đưa nội dung ZIP lên GitHub và deploy trên Vercel Node.js 22.x, giữ cấu hình Next.js. Không có SQL migration. PWA Service Worker được đổi cache version sang `v1.0.2`; người dùng cần tải lại/cập nhật ứng dụng để sử dụng phiên bản này.
