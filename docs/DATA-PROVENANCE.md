# VietWards V0.3.0 — Data provenance & change control

## Mô hình mốc dữ liệu

- Trước sáp nhập = snapshot vào **30/06/2025**, hệ thống 3 cấp 63 tỉnh/thành, 696 huyện, 10.035 đơn vị cấp xã.
- Sau sắp xếp = snapshot từ **01/07/2025**, hệ thống 2 cấp 34 tỉnh/thành, 3.321 đơn vị cấp xã.
- Hiện hành trong V0.3.0 = mốc **23/11/2026**: bản 2025 không thay đổi số lượng nhưng cập nhật loại hình thành phố trực thuộc Trung ương tại Đồng Nai (30/04), Quảng Ninh (01/09), Bắc Ninh (20/09); xã → phường ở Đồng Nai (10, 30/04) và Bắc Ninh (12, 20/09).

## Các nguồn chính

1. Cục Thống kê (GSO/NSO), https://danhmuchanhchinh.nso.gov.vn/ — danh mục & mã hành chính.
2. Quyết định 19/2025/QĐ-TTg, https://chinhphu.vn/?classid=1&docid=214409&pageid=27160&typegroupid=5 .
3. Nghị quyết 202/2025/QH15, https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-202-2025-qh15-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-119250612174148722.htm .
4. Nghị quyết 30/2026/QH16, https://xaydungchinhsach.chinhphu.vn/nghi-quyet-so-30-2026-qh16-thanh-lap-thanh-pho-dong-nai-119260430102336551.htm .
5. Nghị quyết 36/2026/QH16, https://vanban.chinhphu.vn/?classid=1&docid=219325&pageid=27160 .
6. Nghị quyết 39/2026/QH16, https://vanban.chinhphu.vn/?classid=1&docid=219328&orggroupid=1&pageid=27160 .
7. Nghị quyết 237/NQ-UBTVQH16, https://xaydungchinhsach.chinhphu.vn/thanh-lap-10-phuong-thuoc-tinh-dong-nai-119260421072221129.htm .
8. Nghị quyết 388/NQ-UBTVQH16, https://vanban.chinhphu.vn/?docid=219223&pageid=27160 .
9. Nguồn chuẩn hóa máy `vn-local-divisions v1.0.1` (MIT; GSO + sapnhap.bando.com.vn), https://github.com/mtri-git/vn-local-divisions .

## Data flow

- `vn-local-divisions/legacy` → fixed snapshot cũ; `vn-local-divisions/current` → snapshot cấp xã 2025; `vn-local-divisions/convert` → quan hệ nhiều-nhiều.
- Adapter `admin-data.ts` thêm các bản ghi **chuyển loại hình 2026** theo tên chuẩn trong phạm vi một tỉnh, kiểm tra bằng mã hành chính; code cấp tỉnh/cấp xã **không** đổi sau chuyển loại hình.
- Mỗi bản ghi UI có `sourceId`; dữ liệu thay đổi 2026 có `effectiveFrom`. Các bản ghi nền vẫn ghi nguồn chung của bảng danh mục.
- `scripts/verify-data.mjs`: kiểm tra duy nhất, định dạng mã, tổng bản ghi, quan hệ cha/con, phủ 63→34, 22 xã đổi loại hình; CI phải chạy trước khi phát hành.

## Giới hạn

- Bảng quan hệ xã cũ → mới không đủ để suy ra địa chỉ hộ dân hoặc ranh giới ở trường hợp chia nhiều phần.
- Package nguồn là tổng hợp từ GSO, không phải API thời gian thực hoặc cơ sở GIS pháp lý. Các lỗi có thể được báo upstream; dữ liệu nhà nước có giá trị ưu tiên.
- Dữ liệu diện tích, dân số cần giá trị, kỳ thống kê và nguồn độc lập; chưa hiển thị V0.3.0.
- Cần kiểm tra định kỳ thay đổi pháp lý từ sau 23/11/2026. Không tự nhận V0.3.0 luôn mới nhất trong tương lai.

## GIS cấp tỉnh — lớp dữ liệu V0.3.0

- Hiện hành: GeoVN / Vietnamese Provinces Database, 34 features GeoJSON có mã. URL và chú thích nằm trong `src/app/api/map-boundaries/route.ts`.
- Trước sáp nhập: Natural Earth / PiSpace Maps, 63 features public domain được tổng quát hóa; không phải hồ sơ địa giới chính thức năm 2025.
- Lấy qua Vercel server API, đối chiếu mã theo master V0.2.0. Với features không ghép được mã, API trả `metadata.unmatchedNames` và giao diện ghi rõ chưa đối chiếu.
- Dataset ngoài có thể lỗi hoặc cập nhật không tương thích; nếu sai số lượng/định dạng, ứng dụng từ chối và hiện nút thử lại.
- Không khai báo dữ liệu GIS đủ độ chính xác đo đạc hoặc có quyền tái phân phối độc lập chưa được xác minh. Xem `docs/GIS-SOURCE-AND-TESTING.md` và `THIRD_PARTY_NOTICES.md`.
