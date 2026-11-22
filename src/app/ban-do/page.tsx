import type { Metadata } from "next";
import { Map } from "lucide-react";
import { MapWorkbench } from "@/components/map-stage";
import { PageHeader } from "@/components/page-ui";

export const metadata: Metadata = { title: "Khám phá bản đồ" };

export default function MapPage() {
  return <div className="page-content">
    <PageHeader eyebrow="BẢN ĐỒ TƯƠNG TÁC" icon={Map} title="Khám phá bản đồ Việt Nam" description="Trải nghiệm nền tảng xem địa giới hành chính theo từng thời kỳ. Dữ liệu bản đồ sẽ được bổ sung theo roadmap đã phê duyệt."/>
    <MapWorkbench/>
    <div className="disclaimer-line">Lưu ý: V0.1.0 chỉ triển khai nền tảng giao diện. Không có vùng hành chính thực hoặc ranh giới pháp lý nào được trình bày ở màn hình này.</div>
  </div>;
}
