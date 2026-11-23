import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { EducationalExplorer } from "@/components/educational-explorer";
import { PageHeader } from "@/components/page-ui";
import { getLearningPayload } from "@/lib/education-server";

export const metadata: Metadata={title:"Học địa lý · So sánh & thử thách"};
export default function EducationPage(){
  const {catalog,sources}=getLearningPayload();
  return <div className="page-content">
    <PageHeader eyebrow="HỌC TẬP TƯƠNG TÁC" icon={GraduationCap} title="Khám phá và học địa lý" description="So sánh hai tỉnh trực tiếp trên bản đồ, học kiến thức có dẫn nguồn và thử sức cùng câu hỏi địa lý Việt Nam."/>
    <EducationalExplorer catalog={catalog} sources={sources}/>
  </div>;
}
