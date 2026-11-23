import type { Metadata } from "next";
import { ArrowUpRight, BookOpenText, CheckCircle2, CircleDot, Code2, Database, Globe2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-ui";
import { InstallGuide } from "@/components/pwa-lifecycle";
import Link from "next/link";
import { APP, ROADMAP } from "@/lib/config";
import { ADMIN_SOURCES, DATA_CONTEXT } from "@/lib/admin-sources";

export const metadata: Metadata = { title: "Giới thiệu, lộ trình và nguồn dữ liệu" };

const principles = [
  { icon: ShieldCheck, title: "Nguồn trích dẫn", description: "Bộ mã tham chiếu GSO, thay đổi đối chiếu với văn bản pháp lý và mốc hiệu lực." },
  { icon: Globe2, title: "Lịch sử riêng biệt", description: "Ảnh chụp 2025 không bị ghi đè bởi thay đổi 2026; chuyển đổi dựa trên mã đơn vị." },
  { icon: Code2, title: "Dùng trên mọi thiết bị", description: "Responsive, PWA cơ bản, Vercel và không bắt buộc đăng nhập." },
];

export default function AboutPage() {
  return <div className="page-content about-page">
    <PageHeader eyebrow="SẢN PHẨM GIÁO DỤC ĐỊA LÝ" icon={BookOpenText} title="Về VietWards" description="Khám phá đơn vị hành chính Việt Nam với danh mục mã tra cứu thực, thông tin hiệu lực và nguồn tham chiếu minh bạch."/>
    <div className="about-banner"><div className="banner-mark"><Globe2 size={34}/></div><div><span className="eyebrow">BẢN PHÁT HÀNH HIỆN TẠI</span><h2>V{APP.version} — {APP.releaseName}</h2><p>Đã tích hợp danh mục 63/34 tỉnh, 10.035/3.321 đơn vị cấp xã và bản đồ GIS cấp tỉnh hai thời kỳ; tìm kiếm không dấu, đồng bộ lựa chọn với bản đồ và chia sẻ theo URL; đồng thời có bản đồ GIS xã/phường hiện hành, danh mục ba cấp trước 01/07/2025 và liên kết cũ–mới.</p></div><span className="about-banner-badge">INTERACTIVE GIS</span></div>
    <div className="section-heading"><div><span className="eyebrow">QUY CHUẨN SẢN PHẨM</span><h2>Ba nguyên tắc xuyên suốt</h2></div></div>
    <div className="principles-grid three">{principles.map(({ icon: Icon, title, description }) => <div className="principle-card" key={title}><Icon size={22}/><h3>{title}</h3><p>{description}</p></div>)}</div>
    <div className="section-heading"><div><span className="eyebrow">NGUỒN & HIỆU LỰC</span><h2>Nguồn dữ liệu đã sử dụng</h2></div><span className="section-kicker">Đối chiếu pháp lý, không thay thế bản đồ địa giới</span></div>
    <div className="sources-list">{ADMIN_SOURCES.map((source) => <div className="source-row" key={source.id}><strong>{source.title}</strong><span>{source.issuer} · Hiệu lực / mốc dữ liệu: {source.effectiveFrom}</span><div><a href={source.url} target="_blank" rel="noopener noreferrer">Mở nguồn <ArrowUpRight size={14}/></a></div></div>)}</div>
    <div className="source-row" style={{marginTop:12}}><strong>Ranh giới GIS tham khảo (V0.3.0)</strong><span>Hiện hành: GeoVN / Vietnamese Provinces Database. Trước sáp nhập: Natural Earth / PiSpace Maps (public domain). Không phải bản đồ pháp lý.</span><div><a href="https://github.com/truongdinh018/GeoVN" target="_blank" rel="noopener noreferrer">Nguồn bản đồ hiện hành <ArrowUpRight size={14}/></a> <a href="https://maps.pispace.eu/data/vietnam/" target="_blank" rel="noopener noreferrer">Nguồn GIS cũ <ArrowUpRight size={14}/></a></div></div>
    <div className="source-row" style={{marginTop:12}}><strong>Ranh giới xã/phường hiện hành — GeoVN</strong><span>GeoJSON theo từng tỉnh: GeoVN / Vietnamese Provinces Database, nguồn GIS tham khảo thu thập tháng 3/2026. Mã cấp xã được ghép với danh mục V0.2.0 theo mã 5 ký tự, không căn cứ duy nhất vào tên.</span><div><a href="https://github.com/truongdinh018/GeoVN" target="_blank" rel="noopener noreferrer">Nguồn GIS cấp xã <ArrowUpRight size={14}/></a></div></div>
    <div className="sources-card"><Database size={22}/><div><h3>Trạng thái kiểm chứng</h3><p><strong>Dữ liệu nền:</strong> {DATA_CONTEXT.communityDataset}, giấy phép MIT và ghi nhận nguồn GSO. Danh mục cũ có hiệu lực ở mốc {DATA_CONTEXT.legacySnapshot}, danh mục mới có cập nhật loại hình đến {DATA_CONTEXT.currentSnapshot}.</p><p>{DATA_CONTEXT.verificationNote}</p><p><strong>Đến V1.0.1 đã có:</strong> bản đồ cấp tỉnh hai thời kỳ và bản đồ GIS cấp xã hiện hành tải theo tỉnh, đồng bộ danh sách, tìm kiếm, highlight theo mã 5 số (GIS tham khảo, không phải dữ liệu địa giới được nghiệm thu pháp lý). <strong>Chưa đủ dữ liệu để xác nhận:</strong> GIS cấp xã cũ toàn quốc tại mốc 30/06/2025; hệ thống chỉ nhận tệp có thông tin kiểm chứng và giấy phép. Đã bổ sung diện tích, dân số theo nguồn và kỳ số liệu cấp tỉnh (63 tỉnh cũ từ Niên giám 2024; 23 địa phương mới từ Nghị quyết 202/2025/QH15, 11 địa phương giữ nguyên từ Niên giám 2024). Biển số hai thời kỳ theo phụ lục Thông tư 79/2024 và 51/2025. Chưa có thống kê cấp xã đã đối chiếu toàn quốc. V1.0.0 bổ sung trang trạng thái hệ thống, phục hồi lỗi và cập nhật PWA; chưa có bằng chứng kiểm thử deployment/Vercel tại thời điểm đóng gói. V0.9.0 đã bổ sung trang Học địa lý với hướng dẫn theo bước, so sánh Đồng Nai–TP. Hồ Chí Minh, quiz và kiểm định dữ liệu; so sánh chỉ tính chênh lệch khi cùng loại và kỳ tham chiếu. V1.0.1 sửa UI/UX mobile: chọn vùng không che bản đồ và xem chi tiết trong modal toàn màn hình; cải thiện chữ Dark Mode. Không tự tạo ranh giới giả.</p></div></div>
    <div className="section-heading"><div><span className="eyebrow">CÀI ĐẶT & VẬN HÀNH</span><h2>Dùng VietWards như một ứng dụng</h2></div></div>
    <InstallGuide/>
    <p className="vw-status-cta">Xem <Link href="/trang-thai">trạng thái dữ liệu và khả năng vận hành</Link> để biết hạng mục nào đã đối chiếu, hạng mục nào còn hạn chế.</p>
    <div className="section-heading"><div><span className="eyebrow">DEVELOPMENT ROADMAP</span><h2>Lộ trình phát hành</h2></div><span className="section-kicker">10 mốc · V0.1.0 → V1.0.0</span></div>
    <div className="roadmap-list">{ROADMAP.map(({ version, name, detail, status }, index) => <div key={version} className={`roadmap-row ${status === "current" ? "roadmap-active" : ""}`}>
      <div className="roadmap-rail"><span className={`roadmap-number ${status === "current" || status === "done" || status === "partial" ? "active" : ""}`}>{status === "current" || status === "done" ? <CheckCircle2 size={19}/> : <CircleDot size={18}/>}</span>{index !== ROADMAP.length - 1 && <span className="roadmap-line"/>}</div>
      <div className="roadmap-content"><div className="roadmap-topline"><span>V{version}</span>{status === "current" && <b>PHIÊN BẢN HIỆN TẠI</b>}{status === "done" && <b>ĐÃ TRIỂN KHAI</b>}{status === "partial" && <b>CHƯA ĐỦ GIS LỊCH SỬ</b>}</div><h3>{name}</h3><p>{detail}</p></div>
    </div>)}</div>
  </div>;
}
