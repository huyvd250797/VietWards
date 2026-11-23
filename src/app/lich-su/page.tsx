import type { Metadata } from "next";
import { ArrowRight, History, Info } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/page-ui";
import { HistoryExplorer } from "@/components/history-explorer";
import { getProvinceRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Lịch sử sáp nhập" };

export default function HistoryPage() {
  return <div className="page-content">
    <PageHeader eyebrow="SO SÁNH ĐỊA GIỚI" icon={History} title="Trước & sau sáp nhập" description="Đối chiếu thực tế 63 tỉnh/thành trước 01/07/2025 và 34 tỉnh/thành hiện nay, cùng các thay đổi năm 2026."/>
    <div className="history-panel"><div className="history-diagram"><div className="history-node before"><span className="node-small">TRƯỚC 01/07/2025</span><strong>63</strong><span>Tỉnh/thành phố</span></div><div className="history-middle"><ArrowRight size={25}/><small>SẮP XẾP</small></div><div className="history-node after"><span className="node-small">HIỆN TẠI</span><strong>34</strong><span>Tỉnh/thành phố</span></div></div><div className="history-footnote"><Info size={17}/> Mỗi liên kết dưới đây lấy từ mã hành chính và đối chiếu lịch sử, không phải hình polygon.</div></div>
    <HistoryExplorer provinces={getProvinceRows("current")}/>
    <ComingSoon step="V0.5.0" title="Tách / gộp trực quan trên bản đồ" description="Sử dụng quan hệ kế thừa đã thiết lập để zoom và tô màu các vùng tỉnh thành cũ hoặc mới."/>
  </div>;
}
