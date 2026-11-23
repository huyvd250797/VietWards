export const APP = {
  name: "VietWards",
  title: "VietWards — Bản đồ hành chính Việt Nam",
  description:
    "Khám phá địa giới hành chính Việt Nam và hành trình thay đổi trước, sau ngày 01/07/2025.",
  version: "0.9.0",
  releaseName: "Educational Experience & QA",
} as const;

export const PERIODS = {
  current: {
    id: "current",
    label: "Hiện tại",
    shortLabel: "Hiện tại",
    provinceCount: 34,
    description: "Sau sắp xếp 01/07/2025 — gồm các thay đổi hiệu lực về sau",
  },
  before: {
    id: "before",
    label: "Trước 01/07/2025",
    shortLabel: "Trước sáp nhập",
    provinceCount: 63,
    description: "Ảnh chụp hành chính tại ngày 30/06/2025",
  },
} as const;

export type Period = keyof typeof PERIODS;

export const ROADMAP = [
  { version: "0.1.0", name: "Foundation & Design System", detail: "Giao diện, điều hướng, responsive, PWA, cấu hình Vercel", status: "done" },
  { version: "0.2.0", name: "Canonical Administrative Data", detail: "Chuẩn hóa danh mục hành chính, mã, nguồn và hiệu lực", status: "done" },
  { version: "0.3.0", name: "Interactive Vietnam Map", detail: "GIS tương tác, chọn vùng, phủ tối, tự căn khung", status: "done" },
  { version: "0.4.0", name: "Province Explorer", detail: "Danh sách và tìm kiếm tỉnh thành, đồng bộ bản đồ", status: "done" },
  { version: "0.5.0", name: "Historical Merge Viewer", detail: "Tách / gộp vùng trước và sau sáp nhập", status: "done" },
  { version: "0.6.0", name: "Commune & Ward Explorer", detail: "GIS cấp xã hiện hành, chọn vùng, tìm kiếm và lọc", status: "done" },
  { version: "0.7.0", name: "Legacy Administrative Atlas", detail: "Danh mục 3 cấp lịch sử, quan hệ xã cũ–mới và cổng nhập GIS lịch sử được xác minh", status: "done" },
  { version: "0.9.0", name: "Verified Statistics & Plates", detail: "Diện tích và dân số phân kỳ, biển số trước/sau sáp nhập, nguồn từng chỉ tiêu", status: "current" },
  { version: "0.9.0", name: "Educational Experience & QA", detail: "Khám phá có hướng dẫn, so sánh GIS, quiz, kiểm định số liệu và QA", status: "current" },
  { version: "1.0.0", name: "VietWards Public Release", detail: "Phát hành chính thức và quy trình cập nhật", status: "planned" },
] as const;
