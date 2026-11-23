# VietWards V0.3.0 — Interactive Vietnam Map

**VietWards** là web app giáo dục về địa giới hành chính Việt Nam, tra cứu dữ liệu cấp tỉnh và cấp xã ở hai thời kỳ, chạy PC/mobile qua Vercel, không yêu cầu tài khoản hoặc localhost.

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
