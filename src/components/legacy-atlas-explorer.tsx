"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Database, GitMerge, MapPin, Search, ShieldAlert } from "lucide-react";
import type { ProvinceRow, UnitRow } from "@/lib/admin-data";
import { filterCommunes } from "@/lib/commune-search";

type District = { code: string; name: string; count: number };
type Catalog = { provinceCode: string; rows: UnitRow[]; districts: District[] };

/** Legacy three-level browsing remains useful when no 2025-06-30 ward polygons
 * have been verified. Every link opens the same canonical MapExplorer route. */
export function LegacyAtlasExplorer({ provinces }: { provinces: ProvinceRow[] }) {
  const [provinceCode, setProvinceCode] = useState(provinces[0]?.code ?? "");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [district, setDistrict] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    const frame = requestAnimationFrame(() => { setLoading(true); setCatalog(null); setError(""); setDistrict(""); setQuery(""); });
    fetch(`/api/communes?period=before&province=${encodeURIComponent(provinceCode)}`, { signal: abort.signal })
      .then(async (response) => { if (!response.ok) throw new Error("Không thể tải danh mục xã/phường trước sáp nhập."); return response.json() as Promise<Catalog>; })
      .then((value) => { if (!abort.signal.aborted) setCatalog(value); })
      .catch((reason) => { if (!abort.signal.aborted) setError(reason instanceof Error ? reason.message : "Lỗi dữ liệu."); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => { cancelAnimationFrame(frame); abort.abort(); };
  }, [provinceCode]);
  const results = useMemo(() => filterCommunes(catalog?.rows ?? [], query).filter((row) => !district || row.districtCode === district), [catalog, query, district]);
  const shown = results.slice(0, 40);
  return <section className="history-data-card legacy-atlas">
    <div className="history-data-title"><div><span className="eyebrow">DANH MỤC LỊCH SỬ CẤP XÃ</span><h2>Tra cứu tỉnh → huyện → xã trước 01/07/2025</h2>
      <p>Tìm theo mã và tên gốc, xem quan hệ sáp nhập, mở vị trí tỉnh trên bản đồ. Ranh giới xã cũ chỉ hiển thị khi đã có dữ liệu GIS kiểm chứng.</p></div><GitMerge size={25}/></div>
    <div className="legacy-atlas-filters">
      <label><span>Tỉnh/thành cũ (63)</span><select value={provinceCode} onChange={(event) => setProvinceCode(event.target.value)} aria-label="Chọn tỉnh thành trước sáp nhập">
        {provinces.map((row) => <option key={row.code} value={row.code}>{row.name}</option>)}</select></label>
      <label><span>Quận/huyện/thị xã</span><select disabled={!catalog} value={district} onChange={(event) => setDistrict(event.target.value)} aria-label="Chọn huyện cũ">
        <option value="">Tất cả ({catalog?.districts.length ?? 0})</option>
        {catalog?.districts.map((row) => <option key={row.code} value={row.code}>{row.name} ({row.count})</option>)}</select></label>
      <label><span>Tìm xã/phường cũ</span><div className="legacy-atlas-search"><Search size={16}/><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên không dấu hoặc mã 5 chữ số..."/></div></label>
    </div>
    <div className="legacy-atlas-meta"><Database size={15}/>{loading ? "Đang tải danh mục..." : `${results.length} đơn vị phù hợp · ${catalog?.rows.length ?? 0} đơn vị trong tỉnh`}</div>
    {error && <p className="commune-notice" role="alert">{error}</p>}
    {!loading && !error && <div className="legacy-atlas-results">{shown.map((row) =>
      <Link key={row.code} href={`/ban-do?period=before&province=${provinceCode}&level=commune&ward=${row.code}`} className="legacy-atlas-result">
        <MapPin size={15}/><span><strong>{row.name}</strong><small>{row.districtName} · Mã {row.code}</small></span><ArrowUpRight size={15}/>
      </Link>)}
      {!results.length && <p className="gis-empty">Không có địa phương phù hợp.</p>}
      {results.length > shown.length && <p className="legacy-atlas-overflow">Đang hiển thị 40/{results.length} kết quả. Nhập thêm tên hoặc chọn huyện để thu hẹp danh sách.</p>}
    </div>}
    <p className="data-relation-note"><ShieldAlert size={16}/> Danh mục và quan hệ hành chính không thay thế ranh giới GIS. Các xã có điều chỉnh một phần lãnh thổ được ghi rõ trong bảng quan hệ; không nội suy polygon từ tên xã.</p>
  </section>;
}
