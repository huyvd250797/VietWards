# VietWards V0.5.0 — Historical Merge Viewer

**Dựa trên source V0.4.0 do người dùng cung cấp.** Không thay đổi phạm vi Master Data hành chính V0.2.0; không có SQL migration.

## Thay đổi chính

1. AppShell giữ `HistoricalSelection` gồm period, mã đang chọn, tập mã tỉnh đang chọn, origin và mode `single/group`. Không còn hành vi xóa tỉnh khi chuyển thời kỳ.
2. Quan hệ tỉnh cũ và mới lấy trực tiếp từ `getProvinceRows("current")` của canonical server model; client không cố đoán từ tên địa lý.
3. Chuyển `current → before`: chọn đồng thời tất cả tỉnh tiền thân và gán màu nhận diện riêng; chuyển `before → current`: chọn đúng tỉnh kế thừa.
4. MapLibre tạo một lần khi mở bản đồ. Đổi thời kỳ cập nhật GeoJSON qua `GeoJSONSource.setData()`, không tạo lại map/camera. Thao tác chọn tỉnh khác trong cùng thời kỳ vẫn có `fitBounds`, áp dụng cho MultiPolygon.
5. Trang Lịch sử sáp nhập có MapWorkbench trực tiếp, chọn từng quan hệ từ danh sách để dẫn tới bản đồ.
6. URL chia sẻ nhóm `period`, `province`, `group`, `origin` được kiểm tra theo danh mục kế thừa trước khi sử dụng.
7. Bảng thông tin trên map có danh sách các tỉnh tiền thân có thể click, nút căn khung nhóm, nút chuyển thời kỳ, giữ responsive trên mobile.
8. Version và cache PWA chuyển V0.5.0, bổ sung kiểm thử và điều kiện kiểm tra CI.

## Không nằm trong phạm vi

- Polygon cấp xã và quan hệ sáp nhập cấp xã dạng partial (V0.6/V0.7).
- Diện tích/dân số/biển số có nguồn pháp lý hoặc kỳ thống kê riêng (V0.8).
- Chứng nhận hình học GIS là địa giới pháp lý. V0.5 vẫn dùng GeoJSON tham khảo bên thứ ba, và cần kiểm tra mạng/giấy phép/độ khớp trước khi phát hành công khai.

## Kịch bản nghiệm thu bắt buộc

- Đồng Nai 75 hiện tại → trước sáp nhập: Bình Phước 70 và Đồng Nai 75 được tô hai màu khi GIS đối chiếu đầy đủ.
- TP.HCM 79 hiện tại → trước sáp nhập: TP.HCM 79, Bình Dương 74, Bà Rịa – Vũng Tàu 77 được tô ba màu.
- Hà Nội 01 không sáp nhập → chỉ một polygon, không tạo nhóm giả.
- Bình Phước 70 cũ → hiện tại: Đồng Nai 75.
- Giữ nguyên vị trí, zoom, rotation khi chuyển hai thời kỳ. Có nút căn khung toàn vùng và zoom khi chọn vùng mới.
- URL nhóm mở lại đúng màu/vùng; URL nhóm không liên quan bị từ chối.
- Nếu dữ liệu GIS không khớp hoặc lỗi mạng, danh sách quan hệ vẫn hoạt động, hiển thị cảnh báo thay vì vẽ vùng ước lượng.
- Trên mobile: thao tác chọn, chuyển thời kỳ, đóng panel, danh sách tỉnh và nút căn khung không bị che bởi bottom nav.

Xem `docs/QA-REPORT.md` cho kết quả kiểm tra thực tế có thể xác nhận.
