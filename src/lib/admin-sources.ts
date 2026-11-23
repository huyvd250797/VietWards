/** Legal sources take precedence over the reference dataset if conflicts occur. */
export const ADMIN_SOURCES = [
  {
    id: "decision-19-2025",
    title: "Quyết định 19/2025/QĐ-TTg — Bảng danh mục và mã số các đơn vị hành chính Việt Nam",
    issuer: "Thủ tướng Chính phủ",
    effectiveFrom: "2025-07-01",
    url: "https://chinhphu.vn/?classid=1&docid=214409&pageid=27160&typegroupid=5",
    category: "legal",
  },
  {
    id: "resolution-202-2025",
    title: "Nghị quyết 202/2025/QH15 — Sắp xếp đơn vị hành chính cấp tỉnh",
    issuer: "Quốc hội",
    effectiveFrom: "2025-06-12",
    url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-202-2025-qh15-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-119250612174148722.htm",
    category: "legal",
  },
  {
    id: "gso-legacy",
    title: "Danh mục GSO — ảnh chụp hệ thống 63 tỉnh, 696 huyện, 10.035 xã",
    issuer: "Cục Thống kê / Bộ Tài chính",
    effectiveFrom: "2025-06-30",
    url: "https://danhmuchanhchinh.nso.gov.vn/",
    category: "catalog",
  },
  {
    id: "community-package",
    title: "vn-local-divisions 1.0.1 — bộ dữ liệu GSO hai thời kỳ, mã hóa và quan hệ kế thừa",
    issuer: "mtri-git (MIT; nguồn gốc GSO và sapnhap.bando.com.vn)",
    effectiveFrom: "2025-07-01",
    url: "https://github.com/mtri-git/vn-local-divisions",
    category: "reference",
  },
  {
    id: "dong-nai-city-2026",
    title: "Nghị quyết 30/2026/QH16 — Thành lập thành phố Đồng Nai",
    issuer: "Quốc hội",
    effectiveFrom: "2026-04-30",
    url: "https://xaydungchinhsach.chinhphu.vn/nghi-quyet-so-30-2026-qh16-thanh-lap-thanh-pho-dong-nai-119260430102336551.htm",
    category: "legal",
  },
  {
    id: "quang-ninh-city-2026",
    title: "Nghị quyết 36/2026/QH16 — Thành lập thành phố Quảng Ninh",
    issuer: "Quốc hội",
    effectiveFrom: "2026-09-01",
    url: "https://vanban.chinhphu.vn/?classid=1&docid=219325&pageid=27160",
    category: "legal",
  },
  {
    id: "bac-ninh-city-2026",
    title: "Nghị quyết 39/2026/QH16 — Thành lập thành phố Bắc Ninh",
    issuer: "Quốc hội",
    effectiveFrom: "2026-09-20",
    url: "https://vanban.chinhphu.vn/?classid=1&docid=219328&orggroupid=1&pageid=27160",
    category: "legal",
  },
  {
    id: "dong-nai-wards-2026",
    title: "Nghị quyết 237/NQ-UBTVQH16 — Thành lập 10 phường Đồng Nai",
    issuer: "Ủy ban Thường vụ Quốc hội",
    effectiveFrom: "2026-04-30",
    url: "https://xaydungchinhsach.chinhphu.vn/thanh-lap-10-phuong-thuoc-tinh-dong-nai-119260421072221129.htm",
    category: "legal",
  },
  {
    id: "bac-ninh-wards-2026",
    title: "Nghị quyết 388/NQ-UBTVQH16 — Thành lập 12 phường Bắc Ninh",
    issuer: "Ủy ban Thường vụ Quốc hội",
    effectiveFrom: "2026-09-20",
    url: "https://vanban.chinhphu.vn/?docid=219223&pageid=27160",
    category: "legal",
  },
] as const;

export const DATA_CONTEXT = {
  legacySnapshot: "2025-06-30",
  reorganizationFrom: "2025-07-01",
  currentSnapshot: "2026-11-23",
  communityDataset: "vn-local-divisions@1.0.1",
  sourceLicense: "MIT (nguồn dữ liệu tổng hợp; xem NOTICE bên dưới)",
  verificationNote: "Bộ mã và danh mục lấy từ GSO qua nguồn tham chiếu mở. Văn bản pháp lý có giá trị ưu tiên; dữ liệu không thay thế hồ sơ địa giới chính thức.",
} as const;

export const ADMIN_CHANGELOG = [
  { date: "2025-07-01", title: "Vận hành hệ thống 34 tỉnh/thành và 3.321 đơn vị cấp xã", sourceId: "decision-19-2025" },
  { date: "2026-04-30", title: "Đồng Nai trở thành thành phố trực thuộc Trung ương", sourceId: "dong-nai-city-2026" },
  { date: "2026-04-30", title: "10 xã tại Đồng Nai chuyển thành phường", sourceId: "dong-nai-wards-2026" },
  { date: "2026-09-01", title: "Quảng Ninh trở thành thành phố trực thuộc Trung ương", sourceId: "quang-ninh-city-2026" },
  { date: "2026-09-20", title: "Bắc Ninh trở thành thành phố trực thuộc Trung ương", sourceId: "bac-ninh-city-2026" },
  { date: "2026-09-20", title: "12 xã tại Bắc Ninh chuyển thành phường", sourceId: "bac-ninh-wards-2026" },
] as const;

