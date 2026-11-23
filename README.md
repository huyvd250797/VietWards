# VietWards V0.2.0 — Canonical Administrative Data

**VietWards** là web app giáo dục dùng để tra cứu và so sánh đơn vị hành chính Việt Nam trước 01/07/2025 và hiện hành. Bản V0.2.0 được nâng cấp trực tiếp từ VietAtlas V0.1.0, đã đổi thương hiệu toàn bộ sang VietWards.

## Đã triển khai

- Next.js App Router + TypeScript, theme sáng/tối, PC/mobile responsive, PWA cơ bản, Vercel-ready.
- Danh mục tham chiếu **63 tỉnh/thành, 696 quận/huyện, 10.035 xã/phường/thị trấn** cũ (ảnh chụp ngày 30/06/2025).
- Danh mục **34 tỉnh/thành và 3.321 xã/phường/đặc khu** từ 01/07/2025; cập nhật loại hình 3 thành phố trực thuộc TW và 22 xã chuyển phường theo văn bản năm 2026.
- Tra cứu trực tiếp tại `/tinh-thanh`: danh mục tỉnh và mã, xã/phường có mã 5 số, lọc quận/huyện lịch sử, phân trang và tìm không dấu.
- Quan hệ tỉnh cũ → tỉnh mới; quan hệ xã/phường cũ ↔ mới (phân biệt xã cũ chia cho nhiều xã mới). Màn hình `/lich-su` có danh sách đầy đủ 34 tỉnh hiện hành và tiền thân.
- Endpoint nội bộ `/api/administrative`, không cần API key, không cần đăng nhập hoặc cơ sở dữ liệu độc lập.
- Trang `/gioi-thieu` ghi nguồn, hiệu lực, giấy phép và nhật ký cập nhật.
- Bộ kiểm tra tự động cho tổng số, mã hành chính, cha-con, chuyển đổi 63→34 và 22 tên chuyển loại hình năm 2026.

## Giới hạn đã xác định

- **Chưa có polygon GIS**: vùng chọn, highlight, dark-overlay, fitBounds triển khai ở V0.3.0.
- **Chưa có** số liệu dân số/diện tích chính thức chi tiết và biển số xe: thuộc V0.8.0. Không dùng dữ liệu giả.
- Bộ dữ liệu cũ và mới lấy từ thư viện **vn-local-divisions v1.0.1 (MIT)**, xuất phát từ GSO và bảng quan hệ mở. Được xem là **nguồn tổng hợp tham khảo có thể kiểm tra**, không phải dữ liệu địa giới pháp lý được cơ quan nhà nước chứng nhận.
- Cập nhật năm 2026 dùng lớp điều chỉnh có ngày hiệu lực, không sửa ảnh chụp dữ liệu gốc 2025.
- Với xã cũ bị chia cho nhiều nơi, quan hệ chỉ xác định đơn vị liên quan, **không** xác định một địa chỉ hoặc thửa đất thuộc xã mới nào nếu không có GIS và hồ sơ chi tiết.

## Triển khai GitHub + Vercel

1. Đưa toàn bộ các tệp bên trong thư mục nguồn này lên **root** repository GitHub (đảm bảo root có `package.json`).
2. Mở https://vercel.com/new và **Import** repository.
3. Chọn **Next.js**, Node.js **22.x**, command mặc định `npm run build`, nhấn **Deploy**.
4. Mở URL HTTPS được cấp để dùng VietWards. Người dùng không cần chạy localhost hay cài đặt gì.

**Chỉ dành cho người phát triển/CI khi cần kiểm tra:**

```bash
npm install
npm run check:structure
npm run check:data
npm run typecheck
npm run lint
npm run build
```

V0.2.0 yêu cầu npm registry hoạt động lúc cài dependencies, giống các dự án Next.js thông thường. Dữ liệu danh mục nằm trong npm dependency đã ghim phiên bản, không thực hiện gọi API nguồn ngoài khi người dùng truy cập trang. `node_modules`, `.next` không đóng gói vào ZIP.

## API nội bộ

- `GET /api/administrative?mode=provinces&period=current` — 34 tỉnh/thành + số lượng xã.
- `GET /api/administrative?mode=provinces&period=before` — 63 tỉnh/thành và đơn vị kế thừa.
- `GET /api/administrative?mode=units&period=current&province=75&page=1&size=40&q=trang%20bom` — danh sách xã/phường Đồng Nai (cập nhật đến 23/11/2026).
- `GET /api/administrative?mode=units&period=before&province=75&district=<ma-huyen-cu>` — tìm các xã thuộc quận/huyện cũ theo mã thực được tra cứu từ UI (ví dụ `district` là mã 3 chữ số; không suy luận tên từ mã nếu chưa kiểm chứng).
- `GET /api/administrative?mode=relation&period=before&code=00007` — xã cũ và các xã mới nhận một phần/toàn bộ.
- `GET /api/administrative?mode=sources` — nguồn và metadata.

Truy vấn giới hạn 80 bản ghi/trang và sử dụng mã 2/3/5 chữ số dưới dạng **string**, giữ nguyên số 0 đầu.

## Tệp nền tảng

- `src/lib/admin-data.ts`: adapter dữ liệu, chuẩn hóa loại hình năm 2026, thống kê, quan hệ.
- `src/lib/admin-sources.ts`: văn bản nguồn, ngày hiệu lực, nhật ký.
- `src/app/api/administrative/route.ts`: API tra cứu có phân trang.
- `src/components/province-explorer.tsx`: tra cứu tỉnh/xã thực và đối chiếu.
- `src/components/history-explorer.tsx`: quan hệ 63→34 và mốc pháp lý.
- `scripts/verify-data.mjs`: kiểm định dữ liệu, chạy trong GitHub Actions CI.
- `docs/DATA-PROVENANCE.md`: nguồn và giới hạn.
- `docs/ROADMAP.md`: roadmap cố định V0.1.0–V1.0.0.

## Giấy phép & ghi nguồn

VietWards sử dụng dữ liệu từ package `vn-local-divisions@1.0.1` theo MIT, tác giả `mtri-git`. Ghi nguồn và giấy phép trong `THIRD_PARTY_NOTICES.md`; xem thêm https://github.com/mtri-git/vn-local-divisions/blob/main/NOTICE.md và nguồn pháp lý trong ứng dụng. Vẫn phải đối chiếu nghị quyết của cơ quan có thẩm quyền khi có khác biệt.
