# VietWards V0.6.0 — Commune & Ward Explorer

Phát hành nâng cấp trực tiếp từ `VietWards-V0.5.0-Historical-Merge-Viewer(1).zip`.

## Đã triển khai

1. **Bản đồ hành chính hai cấp**: tại `/ban-do`, chọn tỉnh hiện hành từ bản đồ hoặc danh sách, sau đó bấm **Cấp xã/phường**. Có nút **Cấp tỉnh** để quay lại bản đồ lịch sử 34/63 tỉnh.
2. **Danh mục 3.321 đơn vị cấp xã của bộ dữ liệu hiện hành**, tải danh sách theo mã tỉnh qua `/api/communes?province=75`. Có tìm kiếm có/không dấu, mã 5 số; lọc Xã / Phường / Đặc khu. Giữ các chuyển loại hình năm 2026 của V0.2.0.
3. **GeoJSON theo từng tỉnh**, không tải 3.321 polygon một lần. `/api/commune-boundaries?province=75` truy xuất `data/wards/75.geojson` qua server Next.js từ GeoVN; kiểm tra các mã GIS với danh mục hành chính **bằng mã 5 ký tự**.
4. **Highlight / dim**: chọn trực tiếp polygon hoặc dòng danh sách, tô màu xanh vùng đó, làm tối 57% các vùng khác, tự căn khung cả Polygon/MultiPolygon; nút zoom, reset tỉnh và nhãn ở mức zoom lớn.
5. **Sử dụng trên điện thoại**: danh sách xã/phường dạng bottom sheet, vùng thông tin có thể cuộn, bản đồ pan/zoom cảm ứng.
6. **Deep link**: `/ban-do?period=current&province=75&level=commune&ward=25195` (ví dụ mã phường) lưu cấp bản đồ, tỉnh và xã; xử lý đổi tỉnh, bỏ chọn, popstate. URL có mã cấp xã sai sẽ không tự highlight ranh giới.
7. **Tách trạng thái lỗi**: khi GIS không tải được, danh mục vẫn tiếp tục hoạt động; đánh dấu các mã chưa ghép polygon, hiển thị tỷ lệ khớp và nguồn. Không tự vẽ ranh giới giả.
8. **Giữ nguyên tính năng cấp tỉnh** của V0.5.0: lịch sử sáp nhập 34 ↔ 63, tô nhiều tỉnh tiền thân, camera và liên kết chia sẻ.
9. Đồng bộ package version, UI, PWA cache, trang nguồn, tài liệu và CI (`npm run check:communes`).

## Chưa nằm trong V0.6.0

- GIS xã/phường cũ trước 01/07/2025 và ánh xạ hình học cấp xã nhiều-nhiều — V0.7.0.
- Dữ liệu diện tích, dân số được chuẩn hóa theo kỳ thống kê và biển số xe — V0.8.0.
- Độ chính xác hình học pháp lý; bộ GIS tham khảo **không thay thế hồ sơ địa giới chính thức**.

## Nguồn / giới hạn quyền sử dụng

- Danh mục và mã: `vn-local-divisions@1.0.1` + thay đổi loại hình năm 2026 đã có trong source V0.5.0. Cần đối chiếu Quyết định 19/2025/QĐ-TTg và nghị quyết liên quan khi cập nhật.
- GIS: https://github.com/truongdinh018/GeoVN — `data/wards/{provinceCode}.geojson` từ Vietnamese Provinces Database, có nguồn từ Bando.com.vn, thời điểm thu thập 13/03/2026. Phần mã ghép chỉ xác thực **định danh**, không chứng thực từng đoạn đường biên.
- GeoJSON không được copy vào source ZIP; chỉ nạp qua gateway server vào thời điểm truy cập. Trước khi vận hành công khai ở quy mô lớn, chủ dự án cần kiểm tra điều khoản sử dụng/triển khai của nguồn GIS gốc.
- Hình học GIS của nguồn có thể không phản ánh các cập nhật địa giới về sau, nhưng các cập nhật loại hình phường/xã theo mã vẫn lấy từ danh mục hiện hành.

## Tình trạng xác nhận trước phát hành

- Kiểm tra cấu trúc, tên phiên bản và ZIP: thực hiện khi đóng gói.
- Kiểm thử tìm kiếm, mã 5 số, API theo tỉnh, trạng thái lịch sử: thực hiện qua `scripts/verify-commune-explorer.mjs` và các scripts hiện có (phụ thuộc cài package).
- Chưa thể khẳng định `npm run build`, lint và chạy trực tiếp trên Vercel trong môi trường đóng gói nếu không có khả năng tải dependencies từ npm registry.

## Quy trình deploy

1. Upload **nội dung** của ZIP vào root repository GitHub (nơi có `package.json`).
2. Trên Vercel chọn framework Next.js, Node 22.x, build command `npm run build` và Install `npm install`.
3. Sau deploy test `/ban-do?period=current&province=75&level=commune` và `/api/commune-boundaries?province=75`.
4. Với GeoVN bị lỗi 503: danh mục vẫn hoạt động, người dùng có nút thử lại, không dùng dữ liệu vẽ giả.

Không có SQL migration.
