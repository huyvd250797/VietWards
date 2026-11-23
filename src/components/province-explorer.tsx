"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenText, ChevronLeft, ChevronRight, ExternalLink, GitMerge, Layers3, MapPin, Search, ShieldCheck, Tag } from "lucide-react";
import type { ProvinceRow, UnitRow } from "@/lib/admin-data";
import { useAtlas, PeriodToggle } from "./app-shell";
import { provinceHref, searchProvinces, type ProvinceTypeFilter } from "@/lib/province-search";
import { LicensePlateLookup, VerifiedStatisticsPanel } from "./verified-statistics-panel";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
const count = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
type ApiUnits = { rows: UnitRow[]; total: number; page: number; pageSize: number; districts: Array<{ code: string; name: string; count: number }>; error?: string };
type Relation = { status: string; targets: Array<{ code: string; name: string; parentName?: string; partial?: boolean }>; sourceId: string };

export function ProvinceExplorer({ previous, current }: { previous: ProvinceRow[]; current: ProvinceRow[] }) {
  const { period, ready, selectedProvinceCode: selectedCode, selectProvince, navigateProvince } = useAtlas();
  const provinces = period === "before" ? previous : current;
  const [provinceQuery, setProvinceQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProvinceTypeFilter>("all");
  const provinceListRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [wardQuery, setWardQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiUnits | null>(null);
  const [error, setError] = useState("");
  const [relationCode, setRelationCode] = useState("");
  const [relation, setRelation] = useState<Relation | null>(null);
  const [relationLoading, setRelationLoading] = useState(false);
  const relationRequestRef = useRef(0);

  const filtered = useMemo(() => searchProvinces(provinces, provinceQuery, typeFilter), [provinceQuery, provinces, typeFilter]);
  const selected = provinces.find((p) => p.code === selectedCode);

  useEffect(() => {
    if (!selectedCode || provinceQuery) return;
    const box = provinceListRef.current;
    const node = Array.from(box?.querySelectorAll<HTMLButtonElement>("[data-province-code]") ?? [])
      .find((el) => el.dataset.provinceCode === selectedCode);
    if (box && node) box.scrollTo({ top: Math.max(0, node.offsetTop - box.offsetTop - box.clientHeight / 2), behavior: "smooth" });
  }, [selectedCode, period, provinceQuery]);

  useEffect(() => {
    // Period changes must not leave the old district/ward filter attached to another province.
    const frame = window.requestAnimationFrame(() => {
      relationRequestRef.current += 1;
      setWardQuery(""); setDistrict(""); setPage(1); setRelationCode(""); setRelation(null); setResult(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [period, selectedCode]);

  useEffect(() => {
    if (!ready || !selected) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ period, mode: "units", province: selected.code, size: "40", page: String(page) });
    if (district && period === "before") params.set("district", district);
    if (wardQuery.trim()) params.set("q", wardQuery.trim());
    Promise.resolve().then(() => { if (!controller.signal.aborted) { setLoading(true); setError(""); setResult(null); } });
    fetch(`/api/administrative?${params}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json() as Promise<ApiUnits>; })
      .then((data) => { if (!controller.signal.aborted) setResult(data); })
      .catch((cause) => { if (!controller.signal.aborted) { setResult(null); setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu"); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [period, ready, selected?.code, wardQuery, district, page]);

  function chooseProvince(code: string) {
    selectProvince(code);
    setWardQuery(""); setDistrict(""); setPage(1); setRelationCode(""); setRelation(null);
    if (window.matchMedia("(max-width: 760px)").matches) {
      window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }
  async function inspectWard(code: string) {
    if (relationCode === code) { relationRequestRef.current += 1; setRelationCode(""); setRelation(null); setRelationLoading(false); return; }
    const request = ++relationRequestRef.current;
    setRelationCode(code); setRelation(null); setRelationLoading(true);
    try {
      const response = await fetch(`/api/administrative?mode=relation&period=${period}&code=${encodeURIComponent(code)}`);
      if (!response.ok) throw new Error("Không tải được quan hệ");
      const data = await response.json() as Relation;
      if (relationRequestRef.current === request) setRelation(data);
    } catch { if (relationRequestRef.current === request) setRelation(null); }
    finally { if (relationRequestRef.current === request) setRelationLoading(false); }
  }

  return <section className="data-explorer" aria-label="Danh mục địa giới hành chính">
    <div className="data-toolbar"><div><span className="eyebrow">BỘ DỮ LIỆU CÓ MÃ HÀNH CHÍNH</span><h2>Khám phá danh mục</h2></div><PeriodToggle size="large"/></div>
    <div className="data-metrics">
      <span><strong>{period === "current" ? "34" : "63"}</strong> tỉnh/thành phố</span>
      <span><strong>{period === "current" ? "3.321" : "10.035"}</strong> xã/phường{period === "before" ? "/thị trấn" : "/đặc khu"}</span>
      {period === "before" && <span><strong>696</strong> đơn vị cấp huyện cũ</span>}
      <span className="data-date"><ShieldCheck size={15}/> Mốc {period === "before" ? "30/06/2025" : "23/11/2026"}</span>
    </div>
    <div className="data-columns">
      <aside className="data-provinces" aria-label="Danh sách tỉnh thành">
        <div className="data-pane-title"><Layers3 size={17}/> Tỉnh / thành phố <b>{provinces.length}</b></div>
        <label className="data-search"><Search size={17}/><input type="search" aria-label="Tìm tỉnh hoặc mã" placeholder="Tìm tên, mã, TPHCM, Saigon..." value={provinceQuery} onChange={(event) => setProvinceQuery(event.target.value)}/></label>
        <div className="data-province-filters" role="group" aria-label="Lọc loại tỉnh thành">
          {([ ["all", "Tất cả"], ["province", "Tỉnh"], ["city", "Thành phố"] ] as const).map(([value,label]) => <button type="button" key={value} className={typeFilter === value ? "active" : ""} aria-pressed={typeFilter === value} onClick={() => setTypeFilter(value)}>{label}</button>)}
        </div>
        <LicensePlateLookup period={period} onSelectProvince={chooseProvince}/>
        <div className="data-province-count">{filtered.length}/{provinces.length} địa phương</div>
        <div className="data-province-scroll" role="list" ref={provinceListRef}>
          {filtered.map((province) => <button key={province.id} data-province-code={province.code} type="button" role="listitem" className={`data-province ${selected?.code === province.code ? "active" : ""}`} onClick={() => chooseProvince(province.code)} aria-pressed={selected?.code === province.code}>
            <span className="data-code">{province.code}</span><span className="data-province-label"><strong>{province.name}</strong><small>{count(province.communeCount)} đơn vị cấp xã</small></span><ChevronRight size={15}/>
          </button>)}
          {filtered.length === 0 && <p className="data-empty">Không tìm thấy tỉnh/thành phù hợp.</p>}
        </div>
      </aside>
      <div className="data-main" aria-live="polite" ref={detailRef}>
        {!selected ? <div className="data-selection-empty" role={selectedCode ? "alert" : "status"}>
          <div className="data-selection-empty-icon"><MapPin size={26}/></div>
          <h2>{selectedCode ? "Không tìm thấy địa phương" : "Chọn một tỉnh/thành để khám phá"}</h2>
          <p>{selectedCode ? `Mã ${selectedCode} không tồn tại trong kỳ đang xem. Hãy chọn mã hợp lệ trong danh sách bên trái.` : "Chọn tên hoặc tìm kiếm tỉnh/thành ở danh sách bên trái để xem mã hành chính, xã/phường và lịch sử sáp nhập."}</p>
          <Link href={provinceHref("/ban-do", period)}><MapPin size={15}/> Khám phá trên bản đồ <ExternalLink size={14}/></Link>
        </div> : <>
        <div className="data-selected-head">
          <div><span className="eyebrow"><MapPin size={14}/> ĐƠN VỊ HÀNH CHÍNH CẤP TỈNH</span><h2>{selected?.name}</h2><div className="data-selected-sub"><span>Mã hành chính <b>{selected?.code}</b></span><span>{selected?.kind}</span></div></div>
          <span className="data-verified"><ShieldCheck size={16}/> Có nguồn</span>
        </div>
        <VerifiedStatisticsPanel period={period} provinceCode={selected.code}/>
        <div className="data-map-cta"><Link href={provinceHref("/ban-do", period, selected?.code)}><MapPin size={16}/> Xem {selected?.name} trên bản đồ <ExternalLink size={14}/></Link><p>Mở đúng tỉnh/thành và thời kỳ, tự động zoom và làm nổi địa giới khi có dữ liệu GIS đã đối chiếu.</p></div>
        {period === "current" && <div className="data-map-cta"><Link href={`/ban-do?period=current&province=${selected.code}&level=commune`}><Layers3 size={16}/> Xem xã/phường trên bản đồ <ExternalLink size={14}/></Link><p>Đồng bộ mã tỉnh; chỉ tải ranh giới cấp xã tương ứng và cho phép chọn từng vùng.</p></div>}
        <div className="data-selected-metrics"><div><small>Đơn vị cấp xã</small><strong>{count(selected?.communeCount ?? 0)}</strong></div><div><small>{period === "before" ? "Quận / huyện / thị xã" : "Thời điểm tham chiếu"}</small><strong>{period === "before" ? count(selected?.districtCount ?? 0) : "2026"}</strong></div></div>
        <div className="data-merge-info"><GitMerge size={18}/><div><strong>{period === "before" ? "Đơn vị hành chính sau sáp nhập" : "Các tỉnh/thành tiền thân"}</strong>
          {period === "before" ? <p>{selected?.successor?.name ?? "Cần xác minh quan hệ kế thừa của địa phương này"}</p> : <div className="data-chips">{selected?.formerProvinces?.map((p) => <span key={p.code}>{p.name} · {p.code}</span>)}</div>}
        </div>{period === "before" && selected?.successor && <button type="button" className="data-inline-action" onClick={() => { navigateProvince("current", selected.successor!.code); setWardQuery(""); setDistrict(""); setPage(1); setRelationCode(""); setRelation(null); }} aria-label="Xem địa phương hiện hành"><ArrowRight size={18}/></button>}</div>
        <div className="data-unit-heading"><div><h3>Danh mục cấp xã</h3><p>Tên, mã, loại hình và quan hệ kế thừa</p></div><span>{loading ? "Đang tải..." : `${count(result?.total ?? 0)} kết quả`}</span></div>
        <div className="data-filters"><label className="data-search"><Search size={16}/><input aria-label="Tìm xã phường" placeholder="Tìm xã, phường, mã 5 chữ số..." value={wardQuery} onChange={(event) => { setWardQuery(event.target.value); setPage(1); setRelation(null); setRelationCode(""); }}/></label>
          {period === "before" && <select className="data-select" aria-label="Lọc theo quận huyện cũ" value={district} onChange={(event) => { setDistrict(event.target.value); setPage(1); }}><option value="">Tất cả quận/huyện</option>{result?.districts.map((d) => <option key={d.code} value={d.code}>{d.name} · {d.code}</option>)}</select>}
        </div>
        {error && <p className="data-error">Không tải được danh mục: {error}. Hãy thử tải lại trang.</p>}
        <div className={`data-unit-list ${loading ? "data-unit-loading" : ""}`}>
          {!error && !loading && result?.rows.length === 0 && <p className="data-empty">Không tìm thấy đơn vị hành chính phù hợp.</p>}
          {result?.rows.map((ward) => <div key={ward.id} className="data-unit-wrap"><button type="button" className={`data-unit ${relationCode === ward.code ? "selected" : ""}`} onClick={() => { void inspectWard(ward.code); }} aria-expanded={relationCode === ward.code}>
            <span className="data-kind"><Tag size={15}/></span><span className="data-unit-name"><strong>{ward.name}</strong><small>{period === "before" ? `${ward.districtName} · ` : ""}Mã {ward.code}{ward.reclassified ? " · Đổi loại hình năm 2026" : ""}</small></span><span className="data-unit-type">{ward.kind}</span><ChevronRight size={16}/>
          </button>
            {relationCode === ward.code && <div className="data-relation"><div className="data-relation-title"><GitMerge size={15}/> {period === "before" ? "Xã/phường hiện hành liên quan" : "Các đơn vị trước sáp nhập liên quan"}</div>
              {relationLoading ? <p>Đang tra cứu...</p> : relation && relation.targets.length ? <div className="data-relation-targets">{relation.targets.map((target, i) => <span key={`${target.code}-${i}`}>{target.name} <small>{target.code}{target.partial ? " · Một phần" : ""}</small></span>)}</div> : <p>Chưa có đối chiếu đủ tin cậy cho mã này.</p>}
              <p className="data-relation-note">Nguồn đối chiếu: GSO / dữ liệu kế thừa mở. Xã bị chia có thể có nhiều đơn vị đích; không suy ra địa chỉ cụ thể từ tên xã.</p>
            </div>}
          </div>)}
        </div>
        <div className="data-paging"><span>Trang {page} / {Math.max(1, Math.ceil((result?.total ?? 0) / 40))}</span><div><button type="button" onClick={() => { setPage((n) => Math.max(1, n - 1)); setRelation(null); setRelationCode(""); }} disabled={page <= 1}><ChevronLeft size={17}/> Trước</button><button type="button" onClick={() => { setPage((n) => n + 1); setRelation(null); setRelationCode(""); }} disabled={page * 40 >= (result?.total ?? 0)}>Sau <ChevronRight size={17}/></button></div></div>
        <div className="data-provenance"><BookOpenText size={16}/><span>Dữ liệu mã tham chiếu GSO, đối chiếu Quyết định 19/2025/QĐ-TTg và nghị quyết 2026. Thông tin thay đổi được ghi riêng, không ghi đè ảnh chụp lịch sử.</span></div>
        </>}
      </div>
    </div>
  </section>;
}
