"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldAlert, CheckCircle2, Database } from "lucide-react";

type StatusPayload = {
  app: string; version: string; checkedAt: string; state: string;
  checks: {
    provinceCatalog: { ok: boolean; current: number; before: number };
    provincialStatistics: { ok: boolean; current: number; before: number };
    historicalGISManifest: { ok: boolean; verifiedProvinces: number; expectedProvinces: number };
    externalGISRuntime: { checked: boolean; status: string; note: string };
  };
  limitations: string[];
  data: { currentSnapshot: string; legacySnapshot: string };
};
type GeoStatus = { period: "current" | "before"; text: string; success: boolean };

export function StatusDashboard() {
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState<"current" | "before" | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus[]>([]);
  const load = useCallback(async (signal?: AbortSignal) => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/health", { cache: "no-store", signal });
      const data = await response.json() as StatusPayload;
      if (!signal?.aborted) {
        setPayload(data);
        if (!response.ok) setError("Có kiểm tra dữ liệu nền chưa đạt. Vui lòng xem chi tiết.");
      }
    } catch {
      if (!signal?.aborted) setError("Không thể kết nối API trạng thái. Kiểm tra Internet hoặc thử lại.");
    } finally { if (!signal?.aborted) setBusy(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const frame = requestAnimationFrame(() => void load(controller.signal));
    return () => { cancelAnimationFrame(frame); controller.abort(); };
  }, [load]);
  const probeGIS = async (period: "current" | "before") => {
    setGeoBusy(period);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const response = await fetch(`/api/map-boundaries?period=${period}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const dataset = await response.json() as { features?: unknown[]; metadata?: { matchedCount?: number; expected?: number } };
        const expected = period === "current" ? 34 : 63;
        const count = dataset.metadata?.matchedCount ?? 0;
        const success = dataset.features?.length === expected && count === expected;
        setGeoStatus(prev => [...prev.filter(x => x.period !== period), {
          period, text: success ? `Có ${count}/${expected} vùng đã ghép mã (GIS tham khảo, không chứng nhận pháp lý).` :
            `GIS trả về ${count}/${expected} vùng đã ghép mã; chưa thể coi là hoàn chỉnh.`, success,
        }]);
      } finally { clearTimeout(timeout); }
    } catch { setGeoStatus(prev => [...prev.filter(x => x.period !== period), {
      period, success: false, text: "Không thể kiểm tra GIS từ nguồn bên ngoài. Danh mục hành chính vẫn có thể sử dụng.",
    }]); }
    finally { setGeoBusy(null); }
  };
  return <section aria-label="Trạng thái VietWards" className="vw-status-main">
    <div className="vw-status-card">
      <h3><Database size={17} style={{ verticalAlign: "middle" }}/> Kiểm tra dữ liệu nền</h3>
      <p>Kiểm tra tại máy chủ chạy ứng dụng, không gửi thông tin cá nhân đến dịch vụ giám sát.</p>
      <button type="button" className="vw-status-retry" disabled={busy} onClick={() => void load()}><RefreshCw size={15} style={{ verticalAlign: "middle", marginRight: 6 }}/>{busy ? "Đang kiểm tra…" : "Kiểm tra lại"}</button>
      {error && <p role="alert">{error}</p>}
      {payload && <>
        <p role="status">{payload.state === "operational_with_data_limits" ? <CheckCircle2 size={15} color="#0d9488" style={{ verticalAlign: "middle" }}/> : <ShieldAlert size={15} style={{ verticalAlign: "middle" }}/>} {payload.app} V{payload.version} · {payload.state === "operational_with_data_limits" ? "Danh mục và thống kê nền hoạt động, dữ liệu GIS có giới hạn." : "Dữ liệu nền cần kiểm tra."}</p>
        <small>Kiểm tra lúc: {new Date(payload.checkedAt).toLocaleString("vi-VN")}</small>
        <div className="vw-status-grid">
          <div className="vw-status-card"><small>Tỉnh/thành trước / hiện hành</small><strong>{payload.checks.provinceCatalog.before} / {payload.checks.provinceCatalog.current}</strong><small>{payload.checks.provinceCatalog.ok ? "Đạt số lượng danh mục" : "Chưa đạt"}</small></div>
          <div className="vw-status-card"><small>Thống kê cấp tỉnh trước / hiện hành</small><strong>{payload.checks.provincialStatistics.before} / {payload.checks.provincialStatistics.current}</strong><small>{payload.checks.provincialStatistics.ok ? "Có bản ghi thống kê" : "Chưa đạt"}</small></div>
          <div className="vw-status-card"><small>GIS xã cũ được khai báo đã xác minh</small><strong>{payload.checks.historicalGISManifest.verifiedProvinces}/63</strong><small>Không tự suy diễn ranh giới thiếu.</small></div>
          <div className="vw-status-card"><small>Mốc danh mục</small><strong style={{ fontSize: 17 }}>{payload.data.currentSnapshot}</strong><small>Trước sáp nhập: {payload.data.legacySnapshot}</small></div>
        </div>
        <h3>Các giới hạn cần biết</h3>
        <ul className="vw-status-warnings">{payload.limitations.map(x => <li key={x}>{x}</li>)}</ul>
      </>}
    </div>
    <div className="vw-status-card">
      <h3>Kiểm tra nguồn ranh giới GIS (theo yêu cầu)</h3>
      <p>Kiểm tra sẽ tải dữ liệu GIS từ API của VietWards. Nguồn cung cấp bên ngoài có thể chậm hoặc ngừng hoạt động. Kiểm tra này chỉ xác nhận khả năng truy cập và ghép mã, <strong>không chứng nhận độ chính xác địa giới</strong>.</p>
      <div className="vw-error-actions">
        <button type="button" className="vw-status-retry" disabled={geoBusy !== null} onClick={() => void probeGIS("current")}>{geoBusy === "current" ? "Đang tải…" : "Kiểm tra 34 tỉnh"}</button>
        <button type="button" className="vw-status-retry" disabled={geoBusy !== null} onClick={() => void probeGIS("before")}>{geoBusy === "before" ? "Đang tải…" : "Kiểm tra 63 tỉnh cũ"}</button>
      </div>
      {geoStatus.map(s => <p role="status" key={s.period}>{s.success ? "✓" : "!"} {s.period === "current" ? "Hiện tại" : "Trước sáp nhập"}: {s.text}</p>)}
    </div>
  </section>;
}
