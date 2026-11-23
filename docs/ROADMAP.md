# VietWards — Roadmap chuẩn (Baseline V1.0)

**Được chốt:** 22/11/2026 (Asia/Ho_Chi_Minh). **Trạng thái:** FROZEN về phạm vi cấp cao; thay đổi cần yêu cầu rõ ràng. 

## Sứ mệnh

Xây dựng ứng dụng giáo dục địa lý hành chính Việt Nam, dùng được trên PC/mobile qua tên miền Vercel mà không cần localhost, không cần tài khoản. Cho phép xem địa giới **trước 01/07/2025** và **hiện tại**, chọn tỉnh/xã từ bản đồ hoặc danh sách. Khi chọn địa phương, làm nổi vùng đã chọn, các vùng khác phủ tối bán trong suốt; zoom vào đúng ranh giới. Khi chuyển thời kỳ, hiển thị đúng các địa phương tiền thân/kế thừa. Hiển thị diện tích, dân số và ký hiệu biển số xe có nguồn, kỳ số liệu và hiệu lực.

## Quy chuẩn UX và dữ liệu

- Educational GIS: màu xanh dương/trắng/xanh ngọc; tập trung bản đồ, tương phản đọc tốt, dark mode.
- Desktop: sidebar danh mục, bản đồ chính, panel thông tin. Mobile: bản đồ ưu tiên, panel bottom sheet.
- Tương tác bấm bản đồ và chọn danh mục chia sẻ chung state; click vùng ngoài để bỏ chọn.
- Hiện tại → trước sáp nhập: hiển thị các tỉnh cũ với nhiều màu, không thay đổi vùng camera. Ngược lại gộp lại địa phương hiện tại.
- Mỗi administrative unit có code, level, kind, validFrom/validTo, parent, reference GIS và nguồn.
- Dân số/diện tích: giá trị, đơn vị, observedOn, publishedOn, source, verification status.
- Không tự động suy đoán quan hệ cấp xã là gộp nguyên xã khi thực tế có điều chỉnh một phần địa giới.
- Dữ liệu GIS yêu cầu nguồn đáng tin và giấy phép sử dụng rõ ràng; không phát hành ranh giới chưa kiểm chứng như bản đồ pháp lý.
- Cơ cấu hành chính năm 2026 có thay đổi loại đơn vị ở một số địa phương; số lượng tổng 34 không đồng nghĩa dữ liệu 01/07/2025 và dữ liệu hiện tại giống hệt nhau.

## Phiên bản

| Version | Release | Definition of Done |
|---|---|---|
| V0.1.0 | Foundation & Design System | App Router TypeScript, PC/mobile, theme, header/nav, PWA cơ bản, cấu hình Vercel, route hoạt động |
| V0.2.0 | Canonical Administrative Data | Danh mục 63/34 cấp tỉnh, 10.035/3.321 cấp xã theo baseline kiểm chứng; nguồn/mốc hiệu lực đầy đủ; xử lý khác biệt các năm; kiểm tra trùng mã |
| V0.3.0 | Interactive Vietnam Map | MapLibre / vector geometry, click polygon, overlay outside vùng chọn 45–60%, zoom, xử lý MultiPolygon/đảo, kiểm thử hiệu năng |
| V0.4.0 | Province Explorer | Tìm kiếm không dấu, danh sách tỉnh/thành 2 thời kỳ, đồng bộ lựa chọn, focus, kiểm thử keyboard/touch |
| V0.5.0 | Historical Merge Viewer | Chuyển thời kỳ và tách/gộp vùng, hiển thị các tỉnh cũ bằng nhiều màu, giữ camera, xử lý tỉnh không sáp nhập |
| V0.6.0 | Commune & Ward Explorer | Danh sách và hình học cấp xã/phường/đặc khu hiện tại, drill-down, render hiệu năng cao |
| V0.7.0 | Legacy Administrative Atlas | Dữ liệu GIS cấp xã trước sáp nhập, xã cũ-mới và điều chỉnh một phần, cấp huyện lịch sử để tra cứu |
| V0.8.0 | Verified Statistics & Plates | Diện tích, dân số theo kỳ thống kê, mã biển số hiện hành/lịch sử, nguồn trích dẫn, đánh dấu dữ liệu tạm |
| V0.9.0 | Educational Experience & QA | Tương tác so sánh, hướng dẫn học tập, kiểm toán dữ liệu, accessibility, mobile và hiệu suất |
| V1.0.0 | VietWards Public Release | Phát hành hoàn thiện, giám sát lỗi, quy trình cập nhật dữ liệu, caching, PWA và Vercel ổn định |

## Tiến độ hiện tại

Đã nâng cấp source lên **V1.0.0 — VietWards Public Release** (chờ production build và Vercel QA thực tế trước khi công bố nghiệm thu) (bổ sung thống kê và biển số cấp tỉnh có nguồn cho hai thời kỳ; GIS lịch sử cấp xã vẫn chưa có polygon đủ điều kiện kiểm chứng). V0.9.0 bổ sung Học địa lý, so sánh 2 địa phương có điều kiện về kỳ dữ liệu, quiz kiểm chứng và kiểm thử tự động. Bản đồ cấp xã hiện hành có tìm kiếm, lựa chọn và polygon tải theo từng tỉnh; nguồn GIS tham khảo chưa được nghiệm thu pháp lý. V0.7.0 có cổng nhận GIS lịch sử theo tỉnh nhưng không phân phối polygon chưa kiểm chứng (0/63 tỉnh). V1.0.0 bổ sung API/trang trạng thái, xử lý lỗi, cập nhật PWA an toàn, chuẩn hóa metadata phát hành và bộ kiểm thử release; không đồng nghĩa GIS xã cũ hoàn tất.

## Mốc sử dụng được

V0.5.0: bản đồ cấp tỉnh hai thời kỳ với cơ chế tách/gộp là mốc MVP có tương tác GIS thực.

V1.0.0: không được phát hành khi danh mục/xã và ranh giới tuyên bố chính thức chưa đối chiếu nguồn/giấy phép. Cho phép một số dữ liệu có trạng thái pending nếu hiển thị minh bạch và không dùng làm khẳng định pháp lý.

## Nguồn ưu tiên khi phát triển

1. Cổng văn bản Chính phủ / Quốc hội / Bộ Nội vụ: nghị quyết sắp xếp 2025 và điều chỉnh sau đó, quyết định mã đơn vị.
2. Cục Thống kê: niên giám, điều tra dân số, kỳ số liệu mới nhất có thể đối chiếu.
3. Bộ Công an: phụ lục mã biển số xe theo thông tư còn hiệu lực.
4. Cục Đo đạc, Bản đồ và Thông tin địa lý Việt Nam / đơn vị có quyền dữ liệu: bộ polygon tin cậy, điều kiện sử dụng.

Nguồn phải lưu URL cụ thể, ngày công bố, ngày truy xuất, kỳ giá trị và trạng thái kiểm chứng trong bộ dữ liệu V0.2+.

## Tiêu chí kỹ thuật xuyên suốt

- Bấm vùng đã tải: mục tiêu phản hồi <150 ms thiết bị phổ biến, không khóa UI.
- 34/34 cấp tỉnh hiện hành và 63/63 tiền sáp nhập phải tra cứu được.
- Giữ đúng hình học MultiPolygon, đảo và các vùng biệt lập, bảo toàn tọa độ.
- Search/selection hoạt động cả bàn phím và cảm ứng, có aria-label và focus states.
- Deploy Vercel không cần nhập biến môi trường ở bản static-first; không cần localhost cho người dùng.
- Không biến số liệu 2025 thành số liệu hiện tại nếu chưa có cập nhật.

## Scope guard V0.1.0

Không thêm GIS thật, danh sách tên địa phương chưa xác minh, dân số/diện tích cụ thể hoặc tra biển số vào mã V0.1.0. Có thể dùng con số mốc 34/63 như metadata về hai thời kỳ, kèm nhãn mốc tham chiếu. Các route mục tiêu chỉ dựng nền tảng và ghi rõ chức năng dự kiến.
