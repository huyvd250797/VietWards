import type { Metadata } from "next";
import { ArrowRight, History, Info } from "lucide-react";
import { PageHeader } from "@/components/page-ui";
import { HistoryExplorer } from "@/components/history-explorer";
import { MapWorkbench } from "@/components/map-stage";
import { getProvinceRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Lịch sử sáp nhập" };

export default function HistoryPage() {
  const before = getProvinceRows("before");
  const current = getProvinceRows("current");
  return <div className="page-content">
    <PageHeader eyebrow="SO SÁNH ĐỊA GIỚI" icon={History} title="Trước & sau sáp nhập" description="Khám phá 63 tỉnh/thành trước ngày 01/07/2025 và 34 địa phương hiện nay. Chọn một tỉnh và đổi thời kỳ để hiển thị những vùng tiền thân/kế thừa."/>
    <div className="history-panel"><div className="history-diagram"><div className="history-node before"><span className="node-small">TRƯỚC 01/07/2025</span><strong>63</strong><span>Tỉnh/thành phố</span></div><div className="history-middle"><ArrowRight size={25}/><small>SẮP XẾP</small></div><div className="history-node after"><span className="node-small">HIỆN TẠI</span><strong>34</strong><span>Tỉnh/thành phố</span></div></div><div className="history-footnote"><Info size={17}/> Dữ liệu quan hệ cấp tỉnh lấy từ danh mục hành chính. Các vùng bản đồ thuộc hai nguồn GIS riêng và chưa được nghiệm thu pháp lý.</div></div>
    <MapWorkbench previous={before} current={current} historyMode/>
    <HistoryExplorer provinces={current}/>
  </div>;
}
