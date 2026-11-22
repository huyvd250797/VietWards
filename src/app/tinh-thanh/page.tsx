import type { Metadata } from "next";
import { Database, Layers3, MapPin, Search, ShieldCheck } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/page-ui";

export const metadata: Metadata = { title: "Tỉnh & thành phố" };

export default function ProvincePage() {
  return <div className="page-content">
    <PageHeader eyebrow="THƯ VIỆN HÀNH CHÍNH" icon={Layers3} title="Danh sách tỉnh & thành phố" description="Một không gian tra cứu tên, mã địa phương, thông tin dân số và diện tích được gắn nguồn chính thức."/>
    <div className="province-preview">
      <div className="province-preview-top"><h2>Danh mục địa phương</h2><span className="muted-badge">Đang chuẩn bị dữ liệu</span></div>
      <div className="fake-search" aria-disabled="true"><Search size={18}/><span>Tìm theo tên, mã địa phương... (V0.4.0)</span><kbd>⌘ K</kbd></div>
      <div className="province-placeholder-grid">
        {["Tên và mã hành chính", "Diện tích & dân số", "Bản đồ địa giới", "Mã biển số xe"].map((item, index) => <div key={item} className="placeholder-row"><span>{index === 0 ? <MapPin size={19}/> : index === 1 ? <Database size={19}/> : index === 2 ? <Layers3 size={19}/> : <ShieldCheck size={19}/>}</span><div><strong>{item}</strong><p>Có trong các bản phát hành tiếp theo</p></div></div>)}
      </div>
    </div>
    <ComingSoon step="V0.2.0 → V0.4.0" title="Đang chuẩn hóa danh mục hành chính" description="Phiên bản kế tiếp sẽ bắt đầu với dữ liệu danh mục có nguồn gốc. Tìm kiếm theo tên, click vùng và đồng bộ bản đồ sẽ được kích hoạt khi dữ liệu GIS sẵn sàng."/>
  </div>;
}
