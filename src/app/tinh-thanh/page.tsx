import type { Metadata } from "next";
import { Layers3 } from "lucide-react";
import { PageHeader } from "@/components/page-ui";
import { ProvinceExplorer } from "@/components/province-explorer";
import { getProvinceRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Tra cứu tỉnh thành, xã phường" };

export default function ProvincePage() {
  return <div className="page-content">
    <PageHeader eyebrow="DANH MỤC HÀNH CHÍNH THỰC" icon={Layers3} title="Tỉnh thành & xã phường" description="Tra cứu mã hành chính, quận/huyện cũ, xã/phường/đặc khu hai thời kỳ và quan hệ trước–sau sáp nhập. Không yêu cầu tài khoản."/>
    <ProvinceExplorer previous={getProvinceRows("before")} current={getProvinceRows("current")}/>
  </div>;
}
