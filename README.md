# VietWards V0.4.0 — Province Explorer

**VietWards** là web app giáo dục về địa giới hành chính Việt Nam, tra cứu dữ liệu cấp tỉnh và cấp xã ở hai thời kỳ, chạy PC/mobile qua Vercel, không yêu cầu tài khoản hoặc localhost.

## Nâng cấp V0.4.0 — Province Explorer

- Dùng chung một nguồn lựa chọn tỉnh/thành trong `AppShell`: **bản đồ / danh mục hành chính / thanh điều hướng / liên kết** thống nhất mã đơn vị và thời kỳ. Không còn hai bộ `selectedCode` độc lập.
- Tìm kiếm tiếng Việt **có dấu, không dấu, khoảng trắng linh hoạt**, theo mã hai chữ số và tên quen dùng (`TPHCM`, `Sài Gòn`, `Hanoi`); ưu tiên kết quả trùng chính xác, hỗ trợ lọc **Tất cả / Tỉnh / Thành phố**.
- Bản đồ lấy danh sách 34/63 từ **Canonical Administrative Data** V0.2.0 chứ không lấy tên danh sách từ GIS ngoại vi. Nếu thiếu GeoJSON hoặc không ghép được mã, vẫn xem được danh sách và thông tin, có cảnh báo khi không thể highlight vùng.
- Bấm vùng trên bản đồ sẽ chọn đúng dòng danh sách và cuộn tới vùng đang chọn; bấm danh sách cập nhật vùng được chọn và `fitBounds`. Trên mobile danh sách mở như bottom sheet; thẻ thông tin địa phương xuất hiện phía trên thanh điều hướng dưới.
- Chọn tỉnh/thành trong màn hình `/tinh-thanh` rồi nhấn **Xem trên bản đồ** sẽ mở `/ban-do?period=current&province=75` (ví dụ mã 75). Ngược lại, bảng thông tin map có liên kết đến danh mục cấp xã đúng địa phương.
- URL lưu `period` và `province` để chia sẻ và mở trực tiếp, có nút chia sẻ/copy link trên bản đồ. Mở deep link hoặc back/forward sẽ khôi phục lựa chọn; lịch sử sáp nhập tự động tách/gộp vẫn thuộc V0.5.0.
- Làm mới nhãn phiên bản, roadmap, PWA cache và CI; thêm test `npm run check:province` trên Node.js 22.

**Giới hạn:** V0.4.0 vẫn là bản đồ cấp tỉnh với **GIS tham khảo bên thứ ba**, không có bảo đảm pháp lý về địa giới. Bản đồ trước năm 2025 và hiện hành vẫn phụ thuộc kết nối tới nguồn GIS; cần kiểm tra đủ số lượng, độ ghép mã và quyền sử dụng khi triển khai trên Vercel. Diện tích, dân số, mã biển số là phạm vi V0.8.0.

## Nâng cấp V0.3.0

- **Bản đồ MapLibre GL JS** tại `/ban-do`, hai chế độ bản đồ cấp tỉnh: **34 tỉnh/thành hiện hành** và **63 tỉnh/thành trước 01/07/2025**.
- Chạm/bấm vào polygon hoặc chọn từ danh sách tỉnh/thành, tô sáng vùng đã chọn và áp lớp tối ~57% lên các vùng khác. Nền ngoài vùng cũng chuyển tối khi có lựa chọn.
- `fitBounds` theo **toàn bộ tọa độ Polygon/MultiPolygon**, hỗ trợ các phần không liền nhau; reset toàn quốc, zoom +/- và nhãn theo cấp zoom.
- Giao diện PC 3 cột (danh sách — bản đồ — thông tin). Mobile bản đồ ưu tiên, danh sách có thể mở, panel thông tin phía dưới.
- Đồng bộ period với các màn hình và lưu lựa chọn. Khi chuyển thời kỳ, lựa chọn được đặt lại. Tự động tách/gộp giữa thời kỳ thuộc **V0.5.0**.
- Chế độ xem thông tin giữ **mã, tên, loại hình hành chính** từ Canonical Data V0.2.0; các vùng chưa ghép được mã được đánh dấu rõ.
- API nội bộ `GET /api/map-boundaries?period=current|before` để đọc, kiểm tra, chuẩn hóa và cung cấp GeoJSON. Không cần browser truy cập cross-origin trực tiếp tới nguồn GIS.
- Bảo toàn tra cứu danh mục 63/34, 10.035/3.321 cấp xã và API cũ `/api/administrative`.

## Nguồn ranh giới GIS

| Thời kỳ | Nguồn GeoJSON | Giấy phép / cảnh báo |
| --- | --- | --- |
| Hiện hành 34 tỉnh | [GeoVN — provinces.geojson](https://github.com/truongdinh018/GeoVN/blob/main/data/provinces.geojson), dẫn xuất từ Vietnamese Provinces Database | Dữ liệu GIS cộng đồng; xem [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). **Chưa xác minh quyền pháp lý và độ chính xác đo đạc của toàn bộ hình học gốc**. |
| Trước 01/07/2025, 63 tỉnh | [PiSpace Maps — Natural Earth](https://maps.pispace.eu/data/vietnam/) | Public domain Natural Earth, **biên giới tổng quát hóa**, không phải ranh giới pháp lý. |
| Nguồn thay thế nếu nguồn chính lỗi | [Vietnam Interactive Map, 63 tỉnh](https://github.com/thongnv99/vietnam-interactive-map) | Chỉ tải nếu nguồn chính không khả dụng, cần đối chiếu GIS riêng. |

**Đặc biệt:** API lấy bản đồ GIS qua Internet từ các nguồn công khai khi xem bản đồ; Vercel có cache CDN để giảm tải. Nếu nguồn đang lỗi, màn hình hiển thị trạng thái lỗi và nút **Thử tải lại**, **không dựng hình minh họa thay ranh giới thật**. Khi muốn deploy hoàn toàn tự chủ/offline cho GIS, cần có bộ dữ liệu đã được phép phân phối lại và được kiểm tra chính thức.

**Phạm vi dữ liệu:** V0.3.0 chỉ là lớp polygon tỉnh/thành; **chưa có polygon xã/phường**. Không trình bày diện tích, dân số hoặc biển số như số liệu hiện hành nếu chưa có nguồn đủ chuẩn (V0.8.0).

## Đưa source lên Vercel (không cần chạy localhost)

1. Đưa **toàn bộ nội dung** source ZIP lên root của một repository GitHub (root chứa `package.json`).
2. Tại [Vercel New Project](https://vercel.com/new) → Import Git Repository, chọn Next.js và Node.js **22.x**.
3. Giữ Build Command `npm run build`, Install Command `npm install`, nhấn **Deploy**.
4. Truy cập URL HTTPS Vercel cấp. `/ban-do` sẽ gọi endpoint nội bộ `/api/map-boundaries` để nạp GIS.

Không cần `.env`, không có DB phải migration, không dùng khóa API. Lần đầu mở bản đồ cần kết nối Internet và truy cập được nguồn bản đồ GIS. Các chức năng nền V0.2.0 vẫn giữ nguyên.

## Kiểm tra trên môi trường có npm registry

```bash
npm install
npm run check:structure
npm run check:data
npm run check:province
npm run typecheck
npm run lint
npm run build
```

Các script trên cũng được cấu hình trong GitHub Actions CI. File ZIP **không bao gồm** `node_modules` hoặc `.next`.

## API

- `GET /api/map-boundaries?period=current` — GeoJSON 34 tỉnh/thành, tên/mã/loại hình liên kết với dữ liệu chuẩn, metadata nguồn.
- `GET /api/map-boundaries?period=before` — GeoJSON 63 tỉnh/thành, tên/mã đã đối chiếu khi nhận diện được, metadata nguồn.
- `GET /api/administrative?mode=provinces&period=current|before` — danh mục hành chính V0.2.0.
- `GET /api/administrative?mode=units&period=current|before&province=75` — tra cứu đơn vị cấp xã của từng tỉnh.

**Độ chính xác dữ liệu:** nguồn GIS cần kiểm chứng chuyên môn; không được sử dụng bản đồ này để phân định sở hữu/địa giới pháp lý, quy hoạch hay điều hướng an toàn.

## Liên kết tra cứu theo thời kỳ và mã hành chính (V0.4.0)

- `/ban-do?period=current&province=75` — chọn Đồng Nai hiện hành và phóng đến vùng nếu đã đối chiếu GIS.
- `/ban-do?period=before&province=70` — chọn Bình Phước trong snapshot trước 01/07/2025 nếu GIS đã đối chiếu.
- `/tinh-thanh?period=before&province=70` — tra cứu xã/phường cấp tỉnh của Bình Phước cũ.
- `/tinh-thanh?period=current&province=75` — tra cứu danh mục cấp xã Đồng Nai hiện hành.

`province` là mã hai ký tự; mã không hợp lệ không được tự đổi sang địa phương khác. Nếu GIS tải lỗi hoặc mã chưa ghép được với polygon, thông tin danh mục vẫn sử dụng được và phần hình học có thông báo trạng thái.
