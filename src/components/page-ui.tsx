import Link from "next/link";
import { ArrowLeft, ArrowUpRight, type LucideIcon } from "lucide-react";

export function PageHeader({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: string; description: string; icon?: LucideIcon }) {
  return <div className="page-header">
    <div className="page-heading-content">
      <div className="eyebrow">{Icon && <Icon size={15}/>} {eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    <span className="phase-badge">V0.9.0 · EDUCATIONAL EXPERIENCE & QA</span>
  </div>;
}

export function ComingSoon({ step, title, description, href = "/gioi-thieu" }: { step: string; title: string; description: string; href?: string }) {
  return <div className="coming-soon">
    <div className="coming-icon"><ArrowUpRight size={24}/></div>
    <div className="eyebrow">DỰ KIẾN PHÁT HÀNH · {step}</div>
    <h3>{title}</h3>
    <p>{description}</p>
    <Link className="text-link" href={href}>Xem roadmap chi tiết <ArrowUpRight size={16}/></Link>
  </div>;
}

export function BackHome() {
  return <Link href="/" className="text-link"><ArrowLeft size={15}/> Về tổng quan</Link>;
}
