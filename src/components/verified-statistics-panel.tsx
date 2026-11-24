"use client";

import { useEffect, useState } from "react";
import { BookOpenText, CarFront, ExternalLink, Info, MapPinned, Ruler, UsersRound } from "lucide-react";
import type { AdminPeriod } from "@/lib/admin-data";
import type { VerifiedStatsResponse, AreaMetric, PopulationMetric } from "@/lib/verified-statistics";

const fmtArea = (n: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n);

function yearLabel(p: PopulationMetric): string {
  return p.kind === "administrative_scale" ? `Quy mô dân số hành chính · hồ sơ ${p.referencePeriod.slice(0, 4)}`
    : `Dân số trung bình thống kê · ${p.referencePeriod} (làm tròn 100 người)`;
}
function areaLabel(a: AreaMetric): string {
  return `Thời điểm diện tích: ${a.referenceDate.split("-").reverse().join("/")}`;
}

/** Shared by the map's side panel, province directory and commune detail.
 * Data never guessed from GIS area nor from province-to-commune ratio. */
export function VerifiedStatisticsPanel({ period, provinceCode, wardCode = null, dense = false }: {
  period: AdminPeriod; provinceCode: string; wardCode?: string | null; dense?: boolean;
}) {
  // Store the request key alongside its result so switching province/period
  // can never display stale statistics while the next request is in flight.
  const scope = `${period}:${provinceCode}:${wardCode ?? ""}`;
  const [loaded, setLoaded] = useState<{ scope: string; data: VerifiedStatsResponse | null; error: string } | null>(null);
  const current = loaded?.scope === scope ? loaded : null;
  const result = current?.data ?? null;
  const error = current?.error ?? "";
  const pending = !current;
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ period, province: provinceCode });
    if (wardCode) params.set("ward", wardCode);
    fetch(`/api/verified-stats?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải dữ liệu đã đối chiếu");
        return response.json() as Promise<VerifiedStatsResponse>;
      })
      .then((data) => { if (!controller.signal.aborted) setLoaded({ scope, data, error: "" }); })
      .catch((e: unknown) => { if (!controller.signal.aborted) setLoaded({
        scope, data: null, error: e instanceof Error ? e.message : "Lỗi tải số liệu",
      }); });
    return () => { controller.abort(); };
  }, [scope, period, provinceCode, wardCode]);
  return <section className={`verified-panel ${dense ? "verified-panel-compact" : ""}`} aria-label="Thống kê và biển số xe có nguồn" aria-live="polite">
    <div className="verified-panel-head"><BookOpenText size={16}/><strong>Số liệu & biển số có nguồn</strong></div>
    {pending && <p className="verified-muted" role="status">Đang tải số liệu theo thời kỳ…</p>}
    {error && <p className="verified-error" role="alert">{error}. Vẫn có thể tiếp tục dùng bản đồ.</p>}
    {result && <>
      <div className="verified-metric-grid">
        <div className="verified-metric vw-stat-card"><span><Ruler size={14}/> Diện tích</span>
          <strong>{result.area ? `${fmtArea(result.area.valueKm2)} km²` : "Chưa có số liệu xác minh"}</strong>
          {result.area && <small>{areaLabel(result.area)}</small>}</div>
        <div className="verified-metric vw-stat-card"><span><UsersRound size={14}/> Dân số</span>
          <strong>{result.population ? `${fmtNum(result.population.value)} người` : "Chưa có số liệu xác minh"}</strong>
          {result.population && <small>{yearLabel(result.population)}</small>}</div>
      </div>
      {result.density !== null && <div className="verified-density"><span>Mật độ theo hai chỉ tiêu trên</span><strong>{fmtNum(result.density)} người/km²</strong></div>}
      {result.population?.kind === "statistical_average" && <p className="verified-muted">Đây là dân số trung bình năm 2024, không phải dân số hiện tại tại ngày xem. Diện tích là mốc 31/12/2023.</p>}
      {result.population?.kind === "administrative_scale" && <p className="verified-muted">Quy mô dân số trong hồ sơ sáp nhập 2025; không phải dân số thống kê cập nhật năm 2026.</p>}
      {result.level === "commune" && <p className="verified-unavailable"><Info size={15}/> Chưa có diện tích và dân số cấp xã đủ điều kiện kiểm chứng. Không nội suy theo tỷ lệ diện tích GIS.</p>}
      <div className="verified-plate"><span><CarFront size={15}/> {result.level === "commune" ? `Biển số cấp tỉnh: ${result.province.name}` : "Ký hiệu biển số xe"}</span>
        <div className="verified-plates">{result.plateCodes.map((code) => <span className="verified-plate-chip" key={code}>{code}</span>)}{!result.plateCodes.length && <small>Chưa đối chiếu đủ</small>}</div>
        <small>{result.plateNote}</small>
      </div>
      {result.comparison.length > 1 && <details className="verified-comparison">
        <summary><MapPinned size={15}/> So sánh các tỉnh/thành tiền thân ({result.comparison.length})</summary>
        <p className="verified-muted">Địa phương cũ dùng dân số trung bình 2024; địa phương mới dùng quy mô dân số hành chính 2025. Không suy ra chênh lệch tăng dân số giữa hai kỳ.</p>
        <div className="verified-comparison-list">{result.comparison.map((entry) => <div key={entry.code}><strong>{entry.name}</strong><span>{entry.area ? `${fmtArea(entry.area.valueKm2)} km²` : "Thiếu diện tích"} · {entry.population ? `${fmtNum(entry.population.value)} người (2024)` : "Thiếu dân số"}</span><small>Biển số cũ: {entry.plateCodes.join(", ") || "Chưa xác minh"}</small></div>)}</div>
      </details>}
      <details className="verified-sources"><summary><BookOpenText size={14}/> Nguồn số liệu ({result.sources.length})</summary>
        <div>{result.sources.map((source) => <a href={source.url} key={source.id} target="_blank" rel="noopener noreferrer"><span><strong>{source.organization}</strong><small>{source.title}</small><small>{source.notes}</small></span><ExternalLink size={13}/></a>)}</div>
      </details>
    </>}
  </section>;
}

export function LicensePlateLookup({ period, onSelectProvince }: { period: AdminPeriod; onSelectProvince?: (code: string) => void }) {
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");
  const [reply, setReply] = useState<{ scope: string; data: { special: string | null; matches: { code: string; name: string; plateCodes: string[] }[] } | null; error: string } | null>(null);
  const scope = `${period}:${plate}`;
  const loaded = reply?.scope === scope ? reply : null;
  const answer = loaded?.data ?? null;
  const pending = plate.length === 2 && !loaded;
  const shownError = loaded?.error ?? error;
  useEffect(() => {
    if (!/^\d{2}$/.test(plate)) return;
    const controller = new AbortController();
    fetch(`/api/verified-stats?mode=plate&period=${period}&code=${plate}`, { signal: controller.signal })
      .then(async (r) => { if (!r.ok) throw new Error("Tra cứu biển số không thành công"); return r.json() as Promise<{ special: string | null; matches: { code: string; name: string; plateCodes: string[] }[] }>; })
      .then((data) => { if (!controller.signal.aborted) setReply({ scope, data, error: "" }); })
      .catch((e: unknown) => { if (!controller.signal.aborted) setReply({
        scope, data: null, error: e instanceof Error ? e.message : "Không tải được mã biển số",
      }); });
    return () => { controller.abort(); };
  }, [scope, period, plate]);
  return <div className="plate-lookup" aria-label="Tra cứu tỉnh thành theo biển số">
    <label htmlFor="vietwards-plate-lookup"><CarFront size={17}/> Tra cứu biển số xe</label>
    <div className="plate-lookup-input"><input id="vietwards-plate-lookup" inputMode="numeric" maxLength={2} value={plate} placeholder="Ví dụ: 93, 60, 80" onChange={(e) => { setPlate(e.target.value.replace(/\D/g, "").slice(0, 2)); setReply(null); setError(""); }}/></div>
    {plate.length === 1 && <small>Nhập đủ 2 chữ số đầu của biển số.</small>}
    {pending && <small role="status">Đang đối chiếu theo thời kỳ…</small>}
    {shownError && <small role="alert">{shownError}</small>}
    {answer?.special && <small role="status">{answer.special}</small>}
    {answer && !answer.special && !answer.matches.length && <small role="status">Không có tỉnh/thành tương ứng mã {plate} trong kỳ này.</small>}
    {answer?.matches.map((match) => onSelectProvince ?
      <button type="button" key={match.code} onClick={() => onSelectProvince(match.code)}><strong>{match.name}</strong><span>Chọn địa phương · {match.plateCodes.join(", ")}</span></button>
      : <span key={match.code} className="plate-lookup-result">{match.name} · {match.plateCodes.join(", ")}</span>)}
    <small>Tra theo Phụ lục 02, Thông tư {period === "before" ? "79/2024" : "51/2025"}/TT-BCA.</small>
  </div>;
}
