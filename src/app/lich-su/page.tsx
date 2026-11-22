import type { Metadata } from "next";
import { ArrowRight, GitMerge, History, Info, Milestone } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/page-ui";

export const metadata: Metadata = { title: "Lịch sử sáp nhập" };

export default function HistoryPage() {
  return <div className="page-content">
    <PageHeader eyebrow="DÒNG THỜI GIAN" icon={History} title="Địa giới qua những dấu mốc" description="Tìm hiểu Việt Nam trước và sau sắp xếp hành chính, quan sát quá trình hợp nhất và thay đổi tên gọi địa phương."/>
    <div className="history-panel">
      <div className="history-panel-top"><div><span className="eyebrow">CƠ CHẾ SO SÁNH</span><h2>Nhìn thấy sự thay đổi</h2></div><span className="muted-badge"><GitMerge size={15}/> V0.5.0</span></div>
      <div className="history-diagram">
        <div className="history-node before"><span className="node-small">TRƯỚC 01/07/2025</span><strong>63</strong><span>Tỉnh/thành phố</span></div>
        <div className="history-middle"><ArrowRight size={25}/><small>SẮP XẾP</small></div>
        <div className="history-node after"><span className="node-small">TỪ 01/07/2025</span><strong>34</strong><span>Tỉnh/thành phố</span></div>
      </div>
      <div className="history-footnote"><Info size={17}/> Sơ đồ mô tả quy mô hành chính cấp tỉnh; chưa hiển thị dữ liệu tách/gộp địa giới.</div>
    </div>
    <div className="principles-grid">
      <div className="principle-card"><Milestone size={21}/><h3>Đúng mốc hiệu lực</h3><p>Mỗi thay đổi có thời điểm áp dụng và văn bản đi kèm.</p></div>
      <div className="principle-card"><GitMerge size={21}/><h3>Quan hệ kế thừa</h3><p>Hỗ trợ sáp nhập, tách vùng, đổi tên và chuyển loại đơn vị.</p></div>
    </div>
    <ComingSoon step="V0.5.0" title="Chuyển thời kỳ ngay trên bản đồ" description="Chọn một tỉnh hiện hành, chuyển sang trước sáp nhập và quan sát các tỉnh tiền thân được highlight bằng các màu khác nhau."/>
  </div>;
}
