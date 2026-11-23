# QA Report — VietWards V0.5.0 (Historical Merge Viewer)

## Đã kiểm tra trong môi trường đóng gói

- Kế thừa source ZIP V0.4.0 gốc của người dùng và giữ API, dữ liệu hành chính, PWA, phong cách UI hiện có.
- `node scripts/check.mjs`: PASS, cấu trúc và phiên bản V0.5.0.
- `node --experimental-strip-types scripts/verify-historical-selection.mjs`: PASS với dữ liệu fixture 1/2/3 tỉnh tiền thân, chiều hiện tại ↔ trước sáp nhập, nhận diện mã sai, deep link nhóm hợp lệ/không hợp lệ và cấu trúc code camera.
- `node --experimental-strip-types scripts/verify-province-explorer.mjs`: PASS, tìm kiếm tiếng Việt và liên kết danh mục V0.4.0.
- TypeScript syntax AST parsing: 21 TypeScript/TSX source files, zero parse diagnostics.
- Kiểm tra ZIP bằng `zipfile.testzip()` sau khi đóng gói.

## Chưa xác nhận tại môi trường này

- `npm install`, `npm run check:data`, `npm run typecheck`, `npm run lint`, `npm run build`: npm registry không truy cập được; dependencies chưa được cài đặt ở môi trường đóng gói, do đó không thể báo build production đã đạt.
- Browser UI trên Vercel và MapLibre render thực tế, cảm ứng iOS/Android, overlay và độ mượt: chưa kiểm thử trực tiếp.
- Live GeoJSON source (34/63 polygon), `matchedCount` và quyền tái phân phối dữ liệu GIS gốc: cần đối chiếu sau deploy hoặc ở môi trường có Internet.

## Việc cần kiểm tra trên GitHub Actions/Vercel

1. `npm install && npm run check:structure && npm run check:data && npm run check:province && npm run check:history && npm run typecheck && npm run lint && npm run build`
2. Mở `/ban-do?period=current&province=75`, đợi GIS ghép vùng, chuyển kỳ và kiểm tra các màu của Bình Phước / Đồng Nai; chuyển trở lại Đồng Nai mới.
3. Mở `/lich-su?period=current&province=79`, chuyển kỳ để hiển thị TP.HCM, Bình Dương, Bà Rịa – Vũng Tàu; bấm một tỉnh tiền thân và đổi kỳ lại.
4. Hà Nội 01 là tỉnh không sáp nhập; chuyển hai chiều không mất lựa chọn.
5. Khi đổi kỳ, xác nhận camera map không về mặc định; khi chọn tỉnh mới, map mới tự căn vùng và không bị cắt đảo/MultiPolygon.
6. Trên mobile, xác nhận bottom sheet không che toàn bộ bản đồ; thao tác khoanh/zoom/chạm chính xác, bàn phím và màn hình tối hoạt động.
7. Thử chặn nguồn GIS ngoài và kiểm tra cảnh báo/trạng thái dự phòng (không tự vẽ ranh giới sai), danh mục vẫn tra cứu được.
8. Mở URL nhóm không hợp lệ, xác nhận không có hành vi highlight nhầm các tỉnh không cùng quan hệ.
9. Xác minh source/giấy phép/khả năng tiếp cận của cả hai GIS trước khi công bố là dữ liệu đáng tin cậy.

## Scope guard

V0.5.0 không thực hiện polygon cấp xã, thống kê dân số/diện tích hoặc biển số xe; các nội dung này lần lượt thuộc V0.6–V0.8.
