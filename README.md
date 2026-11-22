# VietAtlas V0.1.0 — Foundation & Design System

**VietAtlas** là ứng dụng giáo dục và tra cứu địa giới hành chính Việt Nam, thiết kế cho PC, mobile và tablet. Đây là bản đầu tiên theo roadmap 10 giai đoạn đã chốt.

## Phạm vi V0.1.0

- Khởi tạo Next.js App Router + TypeScript strict mode.
- Giao diện Educational GIS: xanh dương, trắng, xanh ngọc; hỗ trợ light/dark, lưu lựa chọn.
- Responsive: sidebar desktop, bottom navigation + menu drawer mobile.
- 5 màn hình có route thực: `/`, `/ban-do`, `/tinh-thanh`, `/lich-su`, `/gioi-thieu`.
- Bộ chuyển thời kỳ **Hiện tại (34)** / **Trước 01/07/2025 (63)**, lưu lựa chọn giữa các màn hình.
- Dashboard tổng quan, màn hình map-stage dạng placeholder trung thực và roadmap 10 phiên bản.
- PWA cơ bản: manifest App Router, icon 192/512/maskable, apple touch icon, service worker (production), trang fallback offline.
- Cấu hình Vercel (`vercel.json`), `.nvmrc`, metadata SEO và cấu trúc dữ liệu chuẩn bị cho GIS.

**Chưa có ở V0.1.0:** polygon GIS, danh mục chi tiết tỉnh/xã, click chọn tỉnh thực, highlight/mask theo ranh giới, dân số, diện tích chi tiết, biển số xe. Các màn hình thông báo rõ mốc triển khai tiếp theo; không trình bày bản đồ giả như dữ liệu chính thức.

## Triển khai Vercel (không cần localhost)

1. Giải nén ZIP source; tạo repository GitHub mới và upload **nội dung thư mục gốc** (bao gồm `package.json`, `src/`, `public/`).
2. Mở https://vercel.com/new, chọn **Import Git Repository**, cấp quyền GitHub repository chứa VietAtlas.
3. **Framework Preset: Next.js**, **Root Directory: `./`**, **Install Command: mặc định (`npm install`)**, **Build Command: `npm run build`**.
4. Chọn Node.js **22.x** trong Project Settings nếu cần (đã có `.nvmrc`). Không cần Environment Variables và không cần database.
5. Chọn Deploy. Vercel sẽ cài packages, build và xuất website HTTPS. Các lần push commit sau sẽ tự kích hoạt build mới.
6. Đăng nhập Vercel và kết nối GitHub là thao tác chủ tài khoản phải thực hiện; ZIP này **chưa được deploy lên một tên miền công khai**.

> Source được thiết kế để deploy trực tiếp qua Vercel. Do môi trường xây dựng bản bàn giao không kết nối được registry npm, quá trình `npm install` và `next build` đầy đủ không thể chạy tại đây. Kiểm tra cấu trúc và cú pháp được thực hiện trước khi đóng gói, nhưng kết quả build production cần được xác thực bằng Vercel/CI.

## PWA

- Trên iOS: mở domain qua Safari → Share → Add to Home Screen.
- Trên Android/desktop Chrome: chọn Install app nếu trình duyệt hỗ trợ.
- Service worker chỉ đăng ký tại **production**, nhận diện scope `/`.
- Offline mode V0.1.0 hiển thị `public/offline.html` nếu mất kết nối. **Không cache dữ liệu hành chính** để tránh dùng dữ liệu lỗi thời; offline GIS chưa thuộc phạm vi V0.1.0.

## Cấu trúc source

```text
src/
  app/
    page.tsx                    # Dashboard tổng quan
    ban-do/page.tsx             # Bản đồ (GIS placeholder)
    tinh-thanh/page.tsx         # Danh mục địa phương (placeholder)
    lich-su/page.tsx            # Dòng thời gian (placeholder)
    gioi-thieu/page.tsx         # Thông tin, roadmap
    globals.css                 # Design tokens + responsive UI
    layout.tsx                  # Metadata & root layout
    manifest.ts                 # PWA manifest
  components/
    app-shell.tsx               # Sidebar, mobile nav, theme, period, PWA
    home-dashboard.tsx          # Dashboard
    map-stage.tsx               # Bản đồ placeholder
    page-ui.tsx                 # Page header / notice
  lib/
    config.ts                   # Số liệu mốc + roadmap
    domain.ts                   # Kiểu dữ liệu GIS / nguồn / chuyển thời kỳ
public/
  icons/                        # 192, 512, maskable, apple icon
  offline.html                  # Fallback ngoại tuyến
  sw.js                         # Service worker tối giản
scripts/check.mjs               # Kiểm tra cấu trúc phiên bản
vercel.json                     # Preset Next.js
```

## Nếu cần chạy kiểm thử bằng CI hoặc môi trường phát triển

```bash
npm install
npm run check:structure
npm run typecheck
npm run lint
npm run build
```

Có thể sử dụng `npm run dev` trong môi trường phát triển nếu muốn; người sử dụng cuối **không cần localhost**.

## Kiến trúc dự kiến các bản sau

- V0.2.0: thêm danh mục hành chính có nguồn, mã theo văn bản gốc và lịch sử hiệu lực.
- V0.3.0: GIS MapLibre với GeoJSON/PMTiles, highlight và overlay không gian.
- V0.5.0: logic tách/gộp địa giới theo quan hệ kế thừa (bao gồm partial transitions).
- V0.8.0: số liệu diện tích/dân số theo kỳ thống kê, mã biển số, kiểm chứng nguồn.

Dữ liệu pháp lý và GIS **phải được kiểm tra độc lập**; license của một repository thứ ba không đồng nghĩa với quyền phân phối hình học nguồn.

Xem chi tiết tại [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## Giấy phép và nguồn dữ liệu

Source V0.1.0 được tạo mới. Không bao gồm bộ dữ liệu địa giới hành chính bên thứ ba. Việc phân phối bản đồ/dữ liệu về sau cần tuân thủ điều kiện sử dụng dữ liệu và pháp luật có liên quan. Tên VietAtlas là tên sản phẩm đề xuất cho dự án này.
