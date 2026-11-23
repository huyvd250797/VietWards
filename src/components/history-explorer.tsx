"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Focus, GitMerge, Search } from "lucide-react";
import { useAtlas } from "./app-shell";
import { historicHref, singleSelection } from "@/lib/historical-selection";
import type { ProvinceRow } from "@/lib/admin-data";
import { ADMIN_CHANGELOG } from "@/lib/admin-sources";

export function HistoryExplorer({ provinces }: { provinces: ProvinceRow[] }) {
  const { historicalSelection, navigateProvince } = useAtlas();
  const [query, setQuery] = useState("");
  const normalize = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();
  const list = useMemo(() => provinces.filter((p) => normalize(p.name).includes(normalize(query)) ||
    (p.formerProvinces ?? []).some((x) => normalize(x.name).includes(normalize(query)))), [provinces, query]);
  const selectedSuccessor = historicalSelection.period === "current" ? historicalSelection.selectedProvinceCode
    : provinces.find((p) => p.formerProvinces?.some((source) => historicalSelection.selectedProvinceCodes.includes(source.code)))?.code;
  function showHistory(code: string) {
    navigateProvince("current", code);
    document.getElementById("history-map-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return <>
    <section className="history-data-card"><div className="history-data-title"><div><span className="eyebrow">QUAN HỆ KẾ THỪA CẤP TỈNH</span><h2>34 địa phương hiện hành hình thành từ đâu?</h2><p>Chọn một quan hệ bên dưới để làm nổi vùng hiện tại, sau đó dùng bộ chuyển thời kỳ trên bản đồ để tách các tỉnh cũ.</p></div><GitMerge size={27}/></div>
      <label className="data-search"><Search size={17}/><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm tên tỉnh mới hoặc tên tỉnh cũ..." aria-label="Tìm tỉnh trước sau sáp nhập"/></label>
      <div className="history-data-grid">{list.map((province) =>
        <article key={province.id} className={`history-merge-row ${selectedSuccessor === province.code ? "history-merge-active" : ""}`}>
          <div className="history-merge-old">{province.formerProvinces?.map((p) => <span key={p.code}>{p.name} <small>#{p.code}</small></span>)}</div>
          <ArrowRight size={18}/>
          <div className="history-merge-new"><strong>{province.name}</strong><small>Mã {province.code} · {province.communeCount} xã/phường</small>
            <div className="history-actions"><button type="button" onClick={() => showHistory(province.code)} aria-label={`Hiển thị ${province.name} trên bản đồ lịch sử`}><Focus size={14}/> Xem trên bản đồ</button>
              <Link href={historicHref("/ban-do", singleSelection("current", province.code))} aria-label={`Mở bản đồ ${province.name}`}><ChevronRight size={15}/></Link></div>
          </div>
        </article>)}</div>
      {list.length === 0 && <p className="data-empty">Không tìm thấy đơn vị hành chính.</p>}
      <p className="data-relation-note">Tỉnh tiền thân được đối chiếu bằng mã hành chính từ Master Data. Ranh giới GIS trước năm 2025 là dữ liệu bản đồ tham khảo riêng; không giả định polygon là pháp lý.</p>
    </section>
    <section className="history-data-card"><div className="history-data-title"><div><span className="eyebrow">NHẬT KÝ PHÁP LÝ</span><h2>Các mốc cập nhật đã tích hợp</h2></div><CalendarDays size={25}/></div>
      <div className="history-timeline">{ADMIN_CHANGELOG.map((item, i) => <div className="history-timeline-item" key={`${item.date}-${i}`}><strong>{new Date(`${item.date}T00:00:00Z`).toLocaleDateString("vi-VN", { timeZone: "UTC" })}</strong><span>{item.title}</span></div>)}</div>
      <Link className="text-link" href="/gioi-thieu">Xem nguồn pháp lý và quy chuẩn dữ liệu <ArrowRight size={16}/></Link>
    </section>
  </>;
}
