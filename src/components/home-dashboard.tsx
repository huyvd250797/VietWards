"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpenText, Check, Clock3, Database, Globe2, Layers3, Map, MapPinned, GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import { MapStage } from "./map-stage";
import { PeriodToggle, useAtlas } from "./app-shell";
import { PERIODS, ROADMAP } from "@/lib/config";

const quickLinks = [
  { href: "/hoc-dia-ly?tab=compare&a=75&b=79", icon: GraduationCap, title: "Học & so sánh địa lý", description: "So sánh hai tỉnh bằng bản đồ, thống kê và thử thách", tone: "blue" },
  { href: "/ban-do", icon: MapPinned, title: "Khám phá bản đồ", description: "Xem tỉnh thành và từng xã/phường trên bản đồ", tone: "blue" },
  { href: "/tinh-thanh", icon: Layers3, title: "Tỉnh & thành phố", description: "Tra cứu tỉnh, xã phường, mã hành chính thật", tone: "mint" },
  { href: "/lich-su", icon: Clock3, title: "Dòng thời gian", description: "Xem quan hệ sáp nhập có dữ liệu", tone: "violet" },
];

export function HomeDashboard() {
  const { period } = useAtlas();
  return (
    <div className="home-page">
      <div className="top-intro"><span><Sparkles size={15}/> NỀN TẢNG KHÁM PHÁ ĐỊA LÝ VIỆT NAM</span><div className="home-release">Bản phát hành <b>V1.1.2</b></div></div>
      <section className="home-hero" aria-labelledby="hero-heading">
        <div className="hero-text">
          <span className="hero-eyebrow"><span className="hero-eyebrow-dot"/> VIETWARDS · GEOGRAPHIC KNOWLEDGE</span>
          <h1 id="hero-heading">Mỗi vùng đất.<br/><span>Một câu chuyện.</span></h1>
          <p>Khám phá Việt Nam qua địa giới hành chính, lịch sử sáp nhập và những dữ liệu được kiểm chứng. Mọi kiến thức, trên một bản đồ.</p>
          <div className="hero-actions">
            <Link className="button button-white" href="/ban-do"><Map size={18}/> Khám phá bản đồ <ArrowUpRight size={16}/></Link>
            <Link className="button button-hero-subtle" href="/gioi-thieu">Về VietWards <ArrowRight size={17}/></Link>
          </div>
          <div className="hero-fineprint"><Check size={15}/> Không cần tài khoản <span/> Sẵn sàng cho PC & Mobile</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-art-ring r1"/><div className="hero-art-ring r2"/><div className="hero-art-ring r3"/>
          <svg className="hero-silhouette" viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M81 19C61 22 58 42 71 56L59 74L91 97L84 118L98 139L84 165L96 184L85 207L103 223L91 245C72 259 59 253 42 270L55 297L86 290L111 307L147 293L151 275L131 259L126 236L117 216L127 201L112 180L119 161L107 141L115 120L103 98L121 80L112 57L128 40L109 24Z" stroke="white" strokeOpacity=".73" strokeWidth="1.5" strokeLinejoin="round" fill="white" fillOpacity=".10"/>
            <path d="M71 56L110 69M64 74L115 84M89 108L111 119M89 149L118 150M86 195L120 197M91 244L128 245M62 270L149 278" stroke="white" strokeOpacity=".23" strokeWidth="1.2" strokeDasharray="3 5"/>
            <circle cx="105" cy="80" r="3" fill="white"/><circle cx="99" cy="166" r="3" fill="white"/><circle cx="113" cy="259" r="3" fill="white"/>
          </svg>
          <div className="hero-art-badge badge-top"><span className="badge-pulse"/> KHÁM PHÁ LÃNH THỔ</div>
          <div className="hero-art-badge badge-bottom"><Globe2 size={17}/> 2 thời kỳ hành chính</div>
          <div className="hero-art-caption">Hình khối minh họa · không phải dữ liệu địa giới</div>
        </div>
      </section>

      <div className="section-heading section-heading-top"><div><span className="eyebrow">DỮ LIỆU HÀNH CHÍNH</span><h2>Việt Nam qua các thời kỳ</h2></div><span className="section-kicker">Chọn mốc để khám phá</span></div>
      <section className="stats-layout">
        <div className="stat-card stat-card-main">
          <div className="stat-card-top"><span className="stat-icon"><Globe2 size={20}/></span><span className="stat-type">ĐANG CHỌN</span></div>
          <div className="stat-caption">Tỉnh/thành hiện hành và lịch sử</div>
          <div className="stat-number">{PERIODS[period].provinceCount}<span>đơn vị cấp tỉnh</span></div>
          <div className="stat-divider"/>
          <div className="stat-bottom"><span>{PERIODS[period].label}</span><span><TrendingUp size={16}/> Mốc tham chiếu</span></div>
        </div>
        <div className="stat-side">
          <div className="stat-period-card"><div><span className="eyebrow">CHUYỂN THỜI KỲ</span><h3>Hai góc nhìn, một Việt Nam.</h3><p>Chuyển qua lại giữa địa giới trước và sau ngày 01/07/2025.</p></div><PeriodToggle size="large"/></div>
          <div className="source-note"><Database size={17}/><span>Đã tích hợp 34/63 tỉnh thành và 3.321/10.035 đơn vị cấp xã có mã. Xem nguồn dữ liệu và mốc hiệu lực trong phần Giới thiệu.</span></div>
        </div>
      </section>

      <div className="section-heading"><div><span className="eyebrow">KHÔNG GIAN TRẢI NGHIỆM</span><h2>Khởi đầu hành trình khám phá</h2></div><Link className="section-link" href="/ban-do">Mở bản đồ <ArrowUpRight size={17}/></Link></div>
      <MapStage compact/>

      <div className="section-heading"><div><span className="eyebrow">CÁC KHÔNG GIAN</span><h2>Khám phá theo cách của bạn</h2></div></div>
      <div className="quick-grid">{quickLinks.map(({ href, icon: Icon, title, description, tone }) => (
        <Link className="quick-card vw-card" href={href} key={href}><span className={`quick-icon ${tone}`}><Icon size={23}/></span><span className="quick-title">{title} <ArrowUpRight size={17}/></span><span className="quick-description">{description}</span></Link>
      ))}</div>

      <div className="section-heading"><div><span className="eyebrow">CẬP NHẬT PHÁT TRIỂN</span><h2>Các mốc phát triển đã triển khai</h2></div><Link href="/gioi-thieu" className="section-link">Toàn bộ roadmap <ArrowUpRight size={17}/></Link></div>
      <div className="milestone-strip">
        {ROADMAP.slice(6, 10).map(({ version, name, detail, status }, index) => <div className="milestone" key={version}><div className={`milestone-index ${status === "done" ? "now" : ""}`}>{status === "done" ? <Check size={16}/> : `0${index + 4}`}</div><div><div className="milestone-version">V{version} {status === "partial" && <span>GIS LỊCH SỬ CHƯA ĐẦY ĐỦ</span>}</div><h3>{name}</h3><p>{detail}</p></div></div>)}
      </div>
      <div className="home-bottom-note"><BookOpenText size={18}/><span>VietWards được xây dựng với nguyên tắc: <strong>nội dung có nguồn, ranh giới có kiểm chứng, mốc thời gian rõ ràng.</strong></span></div>
    </div>
  );
}
