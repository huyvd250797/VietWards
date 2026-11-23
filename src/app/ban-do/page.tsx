import type { Metadata } from "next";
import { Map } from "lucide-react";
import { MapWorkbench } from "@/components/map-stage";
import { PageHeader } from "@/components/page-ui";

export const metadata: Metadata = { title: "Khám phá bản đồ" };

export default function MapPage() {
  return <div className="page-content">
    <PageHeader eyebrow="BẢN ĐỒ TƯƠNG TÁC" icon={Map} title="Khám phá bản đồ Việt Nam" description="Chọn trực tiếp từng tỉnh/thành trên bản đồ GIS, làm nổi địa giới và chuyển giữa hai thời kỳ hành chính."/>
    <MapWorkbench/>
    <div className="disclaimer-line">Ranh giới GIS từ dữ liệu tham khảo công khai; chưa thay thế hồ sơ địa giới hành chính được cơ quan có thẩm quyền phê duyệt.</div>
  </div>;
}
