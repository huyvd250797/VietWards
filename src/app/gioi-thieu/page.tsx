import type { Metadata } from "next";
import { ArrowUpRight, BookOpenText, CheckCircle2, CircleDot, Code2, Database, Globe2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-ui";
import { APP, ROADMAP } from "@/lib/config";

export const metadata: Metadata = { title: "Giới thiệu & Roadmap" };

const principles = [
  { icon: ShieldCheck, title: "Nguồn chính thức", description: "Số liệu có nguồn, kỳ thống kê và trạng thái kiểm chứng." },
  { icon: Globe2, title: "Ranh giới đáng tin", description: "Chỉ phát hành địa giới GIS khi có nguồn và quyền sử dụng rõ ràng." },
  { icon: Code2, title: "Một ứng dụng, mọi thiết bị", description: "Responsive PC/mobile, PWA cơ bản, deploy Vercel, không bắt đăng nhập." },
];

export default function AboutPage() {
  return <div className="page-content about-page">
    <PageHeader eyebrow="SẢN PHẨM GIÁO DỤC ĐỊA LÝ" icon={BookOpenText} title="Về VietAtlas" description="Dự án khám phá địa giới hành chính Việt Nam qua dữ liệu minh bạch và những trải nghiệm tương tác trực quan."/>
    <div className="about-banner"><div className="banner-mark"><Globe2 size={34}/></div><div><span className="eyebrow">BẢN PHÁT HÀNH HIỆN TẠI</span><h2>V{APP.version} — {APP.releaseName}</h2><p>Nền tảng giao diện, thiết kế đáp ứng, chế độ sáng/tối, điều hướng, PWA và Vercel-ready.</p></div><span className="about-banner-badge">FOUNDATION</span></div>
    <div className="section-heading"><div><span className="eyebrow">QUY CHUẨN SẢN PHẨM</span><h2>Ba nguyên tắc xuyên suốt</h2></div></div>
    <div className="principles-grid three">{principles.map(({ icon: Icon, title, description }) => <div className="principle-card" key={title}><Icon size={22}/><h3>{title}</h3><p>{description}</p></div>)}</div>
    <div className="section-heading"><div><span className="eyebrow">DEVELOPMENT ROADMAP</span><h2>Lộ trình phát hành</h2></div><span className="section-kicker">10 mốc · V0.1.0 → V1.0.0</span></div>
    <div className="roadmap-list">{ROADMAP.map(({ version, name, detail, status }, index) => <div key={version} className={`roadmap-row ${status === "current" ? "roadmap-active" : ""}`}>
      <div className="roadmap-rail"><span className={`roadmap-number ${status === "current" ? "active" : ""}`}>{status === "current" ? <CheckCircle2 size={19}/> : <CircleDot size={18}/>}</span>{index !== ROADMAP.length - 1 && <span className="roadmap-line"/>}</div>
      <div className="roadmap-content"><div className="roadmap-topline"><span>V{version}</span>{status === "current" && <b>PHIÊN BẢN HIỆN TẠI</b>}</div><h3>{name}</h3><p>{detail}</p></div>
    </div>)}</div>
    <div className="sources-card"><Database size={22}/><div><h3>Chính sách kiểm chứng dữ liệu</h3><p>V0.1.0 chưa chứa ranh giới GIS, danh sách hành chính chi tiết hoặc dữ liệu thống kê theo tỉnh. Những nội dung này chỉ được tích hợp sau khi đối chiếu văn bản và quyền sử dụng nguồn dữ liệu.</p><a href="https://vanban.chinhphu.vn/" target="_blank" rel="noopener noreferrer">Tra cứu văn bản Chính phủ <ArrowUpRight size={15}/></a></div></div>
  </div>;
}
