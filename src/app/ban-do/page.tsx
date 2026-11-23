import type { Metadata } from "next";
import { Map } from "lucide-react";
import { MapExplorer } from "@/components/map-explorer";
import { PageHeader } from "@/components/page-ui";
import { getProvinceRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Khám phá bản đồ" };

export default function MapPage() {
  return <div className="page-content">
    <PageHeader eyebrow="BẢN ĐỒ TƯƠNG TÁC" icon={Map} title="Khám phá bản đồ Việt Nam" description="Chọn tỉnh/thành trên bản đồ, sau đó chuyển thời kỳ để xem trực quan các tỉnh tiền thân hoặc địa phương kế thừa mà không mất góc nhìn."/>
    <MapExplorer previous={getProvinceRows("before")} current={getProvinceRows("current")}/>
    <div className="disclaimer-line">Ranh giới GIS từ dữ liệu tham khảo công khai; chưa thay thế hồ sơ địa giới hành chính được cơ quan có thẩm quyền phê duyệt.</div>
  </div>;
}
