import type { Metadata } from "next";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/page-ui";
import { StatusDashboard } from "@/components/status-dashboard";
export const metadata: Metadata = { title: "Trạng thái hệ thống & dữ liệu" };
export default function StatusPage() {
  return <div className="page-content">
    <PageHeader eyebrow="TRANSPARENCY & RELIABILITY" title="Trạng thái VietWards" description="Xem mức độ đầy đủ của dữ liệu hành chính và kiểm tra khả năng truy cập GIS, không nhầm với xác nhận độ chính xác pháp lý." icon={Activity}/>
    <StatusDashboard/>
    <div className="disclaimer-line">VietWards là công cụ giáo dục, không thay thế bản đồ địa giới và số liệu do cơ quan có thẩm quyền phê duyệt.</div>
  </div>;
}
