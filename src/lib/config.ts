export const APP = {
  name: "VietWards",
  title: "VietWards — Bản đồ hành chính Việt Nam",
  description:
    "Khám phá địa giới hành chính Việt Nam và hành trình thay đổi trước, sau ngày 01/07/2025.",
  version: "1.1.2",
  releaseName: "Roadmap Status Type Safety Fix",
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

/** Each roadmap has its own closed state union. Keep their view logic separate. */
export type FoundationRoadmapStatus = "done" | "partial";
export type UXRoadmapStatus = "done" | "current" | "planned";

type RoadmapMilestone<S extends string> = {
  version: string;
  name: string;
  detail: string;
  status: S;
};

export const ROADMAP = [
  { version: "0.1.0", name: "Foundation & Design System", detail: "Giao diện, điều hướng, responsive, PWA, cấu hình Vercel", status: "done" },
  { version: "0.2.0", name: "Canonical Administrative Data", detail: "Chuẩn hóa danh mục hành chính, mã, nguồn và hiệu lực", status: "done" },
  { version: "0.3.0", name: "Interactive Vietnam Map", detail: "GIS tương tác, chọn vùng, phủ tối, tự căn khung", status: "done" },
  { version: "0.4.0", name: "Province Explorer", detail: "Danh sách và tìm kiếm tỉnh thành, đồng bộ bản đồ", status: "done" },
  { version: "0.5.0", name: "Historical Merge Viewer", detail: "Tách / gộp vùng trước và sau sáp nhập", status: "done" },
  { version: "0.6.0", name: "Commune & Ward Explorer", detail: "GIS cấp xã hiện hành, chọn vùng, tìm kiếm và lọc", status: "done" },
  { version: "0.7.0", name: "Legacy Administrative Atlas", detail: "Danh mục lịch sử hoàn thành; GIS xã cũ toàn quốc còn thiếu nguồn được xác minh", status: "partial" },
  { version: "0.8.0", name: "Verified Statistics & Plates", detail: "Diện tích và dân số phân kỳ, biển số trước/sau sáp nhập, nguồn từng chỉ tiêu", status: "done" },
  { version: "0.9.0", name: "Educational Experience & QA", detail: "Khám phá có hướng dẫn, so sánh GIS, quiz, kiểm định số liệu và QA", status: "done" },
  { version: "1.0.0", name: "VietWards Public Release", detail: "Ổn định phần mềm, phục hồi lỗi, PWA cập nhật và công bố rõ giới hạn dữ liệu", status: "done" },
] as const satisfies readonly RoadmapMilestone<FoundationRoadmapStatus>[];


/** Roadmap nâng cấp UX chốt ngày 24/11/2026, độc lập roadmap nền tảng V0.x → V1.0.0. */
export const UX_ROADMAP = [
  { version: "1.0.3", name: "Mobile UX Stabilization", detail: "Header gọn, scroll ổn định, fullscreen, modal và safe-area iPhone", status: "done" },
  { version: "1.1.0", name: "Unified Design System 2.0", detail: "Màu semantic, chữ, card, icon và Light/Dark Mode", status: "current" },
  { version: "1.2.0", name: "Immersive Map Experience 2.0", detail: "Toolbar, zoom, highlight và bản đồ toàn màn hình", status: "planned" },
  { version: "1.3.0", name: "Province & Ward UX 2.0", detail: "Tìm kiếm, chọn địa phương, chi tiết tỉnh và xã", status: "planned" },
  { version: "1.4.0", name: "Navigation & Discovery Redesign", detail: "Tổng quan, điều hướng và hành trình khám phá", status: "planned" },
  { version: "1.5.0", name: "Historical Comparison Experience", detail: "So sánh địa giới và tương tác chuyển thời kỳ", status: "planned" },
  { version: "1.6.0", name: "Geography Challenge UX 2.0", detail: "Đề ngẫu nhiên, nộp bài và xem kết quả", status: "planned" },
  { version: "1.7.0", name: "Achievements & Learning Journey", detail: "Huân chương theo điểm đúng và hành trình học", status: "planned" },
  { version: "1.8.0", name: "Accessibility & PWA Refinement", detail: "VoiceOver, TalkBack, bàn phím, phóng to chữ", status: "planned" },
  { version: "1.9.0", name: "Performance & Motion Optimization", detail: "Cache, memory, FPS và chuyển động", status: "planned" },
  { version: "2.0.0", name: "VietWards UX Release", detail: "Nghiệm thu UI/UX trên mobile và desktop", status: "planned" },
] as const satisfies readonly RoadmapMilestone<UXRoadmapStatus>[];
