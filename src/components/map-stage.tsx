"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight, Check, ChevronRight, Compass, Database, Focus, GitMerge, Info, Layers3,
  LoaderCircle, MapPinned, Minus, Plus, RotateCcw, Search, Share2, ShieldAlert, X,
} from "lucide-react";
import Link from "next/link";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { useAtlas, PeriodToggle } from "./app-shell";
import { PERIODS } from "@/lib/config";
import type { ProvinceRow } from "@/lib/admin-data";
import { historicHref } from "@/lib/historical-selection";
import { provinceHref, searchProvinces, type ProvinceTypeFilter } from "@/lib/province-search";
import { LicensePlateLookup, VerifiedStatisticsPanel } from "./verified-statistics-panel";

type RegionProperties = {
  code: string; name: string; kind: string; matched: boolean; tone: number;
  labelLng: number | null; labelLat: number | null;
};
type RegionGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };
type RegionFeature = { type: "Feature"; id: string; properties: RegionProperties; geometry: RegionGeometry };
type RegionDataset = {
  type: "FeatureCollection"; features: RegionFeature[];
  metadata: { geometryCount: number; expected: number; matchedCount: number; source: string; accuracy: string; unmatchedNames: string[] };
};
const VN_BOUNDS: [[number, number], [number, number]] = [[100.5, 7.4], [116.9, 24.7]];
const FILLS = ["#9dc9de", "#aed4e6", "#8cb9d6", "#a7cbd2", "#b9d7e8"];
const HISTORY_COLORS = ["#2563eb", "#0d9488", "#b453a2", "#b87a1e"];
const SOURCE = "vw-regions";
const LAYER_FILL = "vw-regions-fill";
const LAYER_DIM = "vw-regions-dim";
const LAYER_LINE = "vw-regions-lines";
const LAYER_LABEL = "vw-region-labels";

function boundsFor(features: RegionFeature[]): [[number, number], [number, number]] {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  function walk(node: unknown): void {
    if (!Array.isArray(node)) return;
    if (node.length >= 2 && typeof node[0] === "number" && typeof node[1] === "number") {
      const x = node[0], y = node[1];
      if (Number.isFinite(x) && Number.isFinite(y)) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
      return;
    }
    node.forEach(walk);
  }
  features.forEach((feature) => walk(feature.geometry.coordinates));
  return minX <= maxX && minY <= maxY ? [[minX, minY], [maxX, maxY]] : VN_BOUNDS;
}

function matchedFeatures(dataset: RegionDataset | null, codes: string[]) {
  const lookup = new Set(codes);
  return (dataset?.features ?? []).filter((feature) => lookup.has(feature.properties.code) && feature.properties.matched);
}

/** Paint is derived from the canonical selection; one map instance survives period switches. */
function applyHighlight(map: MapLibreMap, selectedCodes: string[]) {
  if (!map.getLayer(LAYER_FILL)) return;
  const active = selectedCodes.length > 0;
  const colorArgs: string[] = selectedCodes.flatMap((code, i) => [code, HISTORY_COLORS[i % HISTORY_COLORS.length]]);
  map.setPaintProperty(LAYER_FILL, "fill-color", active
    ? ["match", ["get", "code"], ...colorArgs, ["match", ["get", "tone"], 0, FILLS[0], 1, FILLS[1], 2, FILLS[2], 3, FILLS[3], FILLS[4]]]
    : ["match", ["get", "tone"], 0, FILLS[0], 1, FILLS[1], 2, FILLS[2], 3, FILLS[3], FILLS[4]]);
  map.setPaintProperty(LAYER_DIM, "fill-opacity", active
    ? ["match", ["get", "code"], ...selectedCodes.flatMap((code) => [code, 0]), 0.57]
    : 0);
  map.setPaintProperty(LAYER_LINE, "line-width", active
    ? ["match", ["get", "code"], ...selectedCodes.flatMap((code) => [code, 2.8]), 0.9]
    : 0.9);
  map.setPaintProperty(LAYER_LINE, "line-color", active
    ? ["match", ["get", "code"], ...selectedCodes.flatMap((code) => [code, "#ffffff"]), "#c4d3db"]
    : "#ffffff");
  map.setPaintProperty(LAYER_LABEL, "text-color", active
    ? ["match", ["get", "code"], ...selectedCodes.flatMap((code) => [code, "#063647"]), "#d0dee4"]
    : "#224b62");
  map.setPaintProperty("vw-background", "background-color", active ? "#132c3b" : "#e8f5f9");
}

export function MapStage({ compact = false }: { compact?: boolean }) {
  const { period } = useAtlas();
  return <Link href="/ban-do" className={`map-stage gis-preview ${compact ? "map-stage-compact" : ""}`}>
    <div className="map-stage-top"><div className="map-stage-label"><span className="live-dot"/> KHÁM PHÁ BẢN ĐỒ</div><span className="map-stage-tag">GIS · V1.0.1</span></div>
    <div className="gis-preview-art" aria-hidden="true"><span className="gis-preview-grid"/><MapPinned size={72} strokeWidth={1.15}/><div className="gis-preview-orbit"/></div>
    <div className="gis-preview-copy"><span className="map-stage-eyebrow">BẢN ĐỒ TƯƠNG TÁC</span><h3>Khám phá từng vùng đất.</h3>
      <p>Chọn tỉnh, đổi thời kỳ để xem các tỉnh tiền thân trực tiếp trên bản đồ.</p>
      <span className="gis-preview-chip"><Layers3 size={15}/> {PERIODS[period].label} · {PERIODS[period].provinceCount} tỉnh/thành</span>
      <span className="gis-preview-link">Mở bản đồ <ArrowUpRight size={17}/></span>
    </div>
  </Link>;
}

export function MapWorkbench({ previous, current, historyMode = false, onExploreCommunes }: { previous: ProvinceRow[]; current: ProvinceRow[]; historyMode?: boolean; onExploreCommunes?: () => void }) {
  const { period, ready, historicalSelection, selectedProvinceCode: selected, selectProvince, changePeriod } = useAtlas();
  const provinces = period === "before" ? previous : current;
  const activeCodes = historicalSelection.selectedProvinceCodes;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const chooseRef = useRef<(code: string | null) => void>(() => {});
  const [dataset, setDataset] = useState<RegionDataset | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProvinceTypeFilter>("all");
  const [shareStatus, setShareStatus] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  // A tap on a province is for exploring its polygon. Details are opt-in on mobile.
  const [detailOpen, setDetailOpen] = useState(false);
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  const detailTriggerRef = useRef<HTMLButtonElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showNames, setShowNames] = useState(true);
  const showNamesRef = useRef(true);
  const lastCamera = useRef<{ period: string; codes: string } | null>(null);

  const select = useCallback((code: string | null) => {
    selectProvince(code);
    setDetailOpen(false);
    if (code) setListOpen(false);
  }, [selectProvince]);
  // Event listeners installed once must always call the latest selection handler.
  useEffect(() => { chooseRef.current = select; }, [select]);

  const closeDetails = useCallback(() => {
    setDetailOpen(false);
    window.requestAnimationFrame(() => detailTriggerRef.current?.focus());
  }, []);
  useEffect(() => {
    if (!detailOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => detailCloseRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetails();
      if (event.key !== "Tab") return;
      const dialog = detailCloseRef.current?.closest<HTMLElement>("[role=dialog]");
      const elements = Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]') ?? []).filter(node => node.getClientRects().length > 0);
      if (!elements.length) return;
      const first = elements[0]; const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [detailOpen, closeDetails]);
  useEffect(() => {
    // A period transition changes the meaning of the selected administrative code.
    const frame = requestAnimationFrame(() => setDetailOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [period]);

  const focusFeatures = useCallback((features: RegionFeature[]) => {
    if (!features.length || !mapRef.current) return;
    mapRef.current.fitBounds(boundsFor(features), {
      padding: window.innerWidth < 800 ? 42 : { top: 56, bottom: 56, left: 70, right: 70 },
      maxZoom: 9.6,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550,
    });
  }, []);
  const reset = useCallback(() => {
    select(null);
    mapRef.current?.fitBounds(VN_BOUNDS, { padding: 16, duration: 500 });
  }, [select]);

  async function shareSelection() {
    if (!selected) return;
    const url = new URL(historicHref("/ban-do", historicalSelection), window.location.origin).toString();
    try {
      if (navigator.share && window.matchMedia("(max-width: 680px)").matches) {
        await navigator.share({ title: "VietWards · Lịch sử địa giới", url });
        setShareStatus("Đã mở bảng chia sẻ");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("Đã sao chép liên kết");
      } else setShareStatus("Trình duyệt không hỗ trợ sao chép tự động");
    } catch (cause) {
      if ((cause as Error)?.name !== "AbortError") setShareStatus("Không thể chia sẻ. Hãy sao chép URL trên thanh địa chỉ.");
    }
  }

  // Create exactly one MapLibre instance per mounted workbench. Swapping a GIS
  // snapshot only replaces GeoJSON source data, preserving center/bearing/zoom.
  useEffect(() => {
    if (!ready || !containerRef.current) return;
    let cancelled = false;
    async function initialize() {
      try {
        const maplibregl = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: { version: 8, glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf", sources: {}, layers: [
            { id: "vw-background", type: "background", paint: { "background-color": "#e8f5f9" } },
          ] },
          center: [106.35, 16], zoom: 4.4, minZoom: 3.3, maxZoom: 12,
          renderWorldCopies: false, attributionControl: false,
          maxBounds: [[97.1, 2.5], [121.5, 28.5]],
        });
        mapRef.current = map;
        map.on("load", () => {
          if (cancelled) return;
          map.addSource(SOURCE, { type: "geojson", promoteId: "code", data: { type: "FeatureCollection", features: [] } });
          map.addLayer({ id: LAYER_FILL, type: "fill", source: SOURCE, paint: {
            "fill-color": ["match", ["get", "tone"], 0, FILLS[0], 1, FILLS[1], 2, FILLS[2], 3, FILLS[3], FILLS[4]],
            "fill-opacity": 0.98, "fill-color-transition": { duration: 280, delay: 0 },
          } });
          map.addLayer({ id: LAYER_DIM, type: "fill", source: SOURCE, paint: {
            "fill-color": "#071a2c", "fill-opacity": 0, "fill-opacity-transition": { duration: 260, delay: 0 },
          } });
          map.addLayer({ id: LAYER_LINE, type: "line", source: SOURCE, paint: { "line-color": "#fff", "line-width": 0.9 } });
          map.addLayer({ id: LAYER_LABEL, type: "symbol", source: SOURCE, minzoom: 5.25, layout: {
            "text-field": ["get", "name"], "text-size": ["interpolate", ["linear"], ["zoom"], 5.25, 10, 8, 12],
            "text-font": ["Open Sans Regular"], "text-max-width": 8, "text-allow-overlap": false,
            "visibility": showNamesRef.current ? "visible" : "none",
          }, paint: { "text-color": "#224b62", "text-halo-color": "#e8f5f9", "text-halo-width": 1.15 } });
          map.on("mouseenter", LAYER_FILL, () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", LAYER_FILL, () => { map.getCanvas().style.cursor = "grab"; });
          map.on("click", LAYER_FILL, (event) => {
            const code = event.features?.[0]?.properties?.code;
            if (typeof code === "string" && event.features?.[0]?.properties?.matched) {
              chooseRef.current(code);
            }
          });
          map.on("click", (event) => {
            if (!map.queryRenderedFeatures(event.point, { layers: [LAYER_FILL] }).length) chooseRef.current(null);
          });
          map.fitBounds(VN_BOUNDS, { padding: 12, duration: 0 });
          setMapReady(true);
        });
        map.on("error", (evt) => console.warn("VietWards map engine:", evt.error));
      } catch (cause) {
        if (!cancelled) { setError(cause instanceof Error ? cause.message : "Không thể khởi tạo MapLibre"); setLoading(false); }
      }
    }
    void initialize();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, [ready]);

  // Fetch only when period (or manual Retry) changes. The map instance is NOT remounted.
  useEffect(() => {
    if (!ready || !mapReady || !mapRef.current) return;
    const abort = new AbortController();
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/map-boundaries?period=${period}`, { signal: abort.signal });
        if (!response.ok) {
          const payload: { error?: string } = await response.json().catch(() => ({}));
          throw new Error(payload.error || `Không tải được dữ liệu địa giới (HTTP ${response.status})`);
        }
        const geojson = await response.json() as RegionDataset;
        if (cancelled || abort.signal.aborted) return;
        if (geojson.features.length !== PERIODS[period].provinceCount) throw new Error("GIS không khớp số tỉnh/thành của thời kỳ.");
        const map = mapRef.current;
        const source = map?.getSource(SOURCE) as GeoJSONSource | undefined;
        if (!source) throw new Error("Bản đồ chưa sẵn sàng nhận dữ liệu GIS.");
        source.setData({ type: "FeatureCollection", features: geojson.features } as unknown as Parameters<GeoJSONSource["setData"]>[0]);
        setDataset(geojson);
        setLoading(false);
      } catch (cause) {
        if (cancelled || abort.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Lỗi không xác định khi tải GIS");
        setLoading(false);
      }
    }
    // Clear the old source before starting the new request. A warm cache must not
    // be able to finish a fetch and then get erased by a delayed animation frame.
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      setDataset(null); setError(""); setLoading(true); setQuery(""); setTypeFilter("all");
      const source = mapRef.current?.getSource(SOURCE) as GeoJSONSource | undefined;
      source?.setData({ type: "FeatureCollection", features: [] });
      void load();
    });
    return () => { cancelled = true; abort.abort(); window.cancelAnimationFrame(frame); };
  }, [period, requestId, ready, mapReady]);

  const matched = useMemo(() => matchedFeatures(dataset, activeCodes), [dataset, activeCodes]);
  const matchedCodes = useMemo(() => new Set(dataset?.features.filter((f) => f.properties.matched).map((f) => f.properties.code) ?? []), [dataset]);
  const shown = useMemo(() => searchProvinces(provinces, query, typeFilter), [provinces, query, typeFilter]);
  const active = provinces.find((row) => row.code === selected) ?? null;
  const grouped = period === "before" && historicalSelection.mode === "group" && activeCodes.length > 1;
  const groupRows = grouped ? activeCodes.map((code) => provinces.find((row) => row.code === code)).filter((row): row is ProvinceRow => !!row) : [];
  const allMapped = !!dataset && activeCodes.every((code) => matchedCodes.has(code));

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    // The selected state is canonical even if a GIS source could not match it.
    applyHighlight(map, matched.map((feature) => feature.properties.code));
    if (!dataset || !activeCodes.length || matched.length === 0) return;
    const key = activeCodes.join(",");
    const previous = lastCamera.current;
    lastCamera.current = { period, codes: key };
    if (!previous || (previous.period === period && previous.codes !== key)) focusFeatures(matched);
    // On cross-period transitions deliberately keep center, zoom, pitch and bearing.
  }, [mapReady, dataset, matched, period, activeCodes, focusFeatures]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShareStatus(""));
    return () => window.cancelAnimationFrame(frame);
  }, [selected, period]);
  useEffect(() => {
    if (!listOpen) return;
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") setListOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [listOpen]);
  useEffect(() => {
    const box = listRef.current;
    if (!box || !selected || query) return;
    const node = Array.from(box.querySelectorAll<HTMLButtonElement>("[data-province-code]"))
      .find((element) => element.dataset.provinceCode === selected);
    if (!node) return;
    box.scrollTo({ top: Math.max(0, node.offsetTop - box.offsetTop - box.clientHeight / 2 + node.clientHeight / 2), behavior: "smooth" });
  }, [selected, query, period, dataset]);

  return <section className={`gis-workbench ${historyMode ? "gis-workbench-history" : ""}`} aria-label="Bản đồ địa giới tương tác" id={historyMode ? "history-map-anchor" : undefined}>
    <header className="gis-toolbar">
      <div className="gis-toolbar-copy"><span className="gis-overline"><span className="live-dot"/> {historyMode ? "ĐỐI CHIẾU ĐỊA GIỚI" : "ĐỊA GIỚI TƯƠNG TÁC"}</span><h2>{historyMode ? "Bản đồ trước và sau sáp nhập" : "Bản đồ hành chính Việt Nam"}</h2><p>Chọn tỉnh/thành, sau đó đổi thời kỳ để xem tách hoặc gộp địa giới.</p></div>
      <div className="gis-toolbar-controls"><PeriodToggle size="large"/></div>
    </header>
    <div className="gis-layout">
      <aside className={`gis-region-panel ${listOpen ? "gis-list-open" : ""}`}>
        <div className="gis-panel-head"><div><Layers3 size={17}/><strong>Danh sách địa phương</strong></div><span>{provinces.length}</span></div>
        <button type="button" className="gis-mobile-list-close" onClick={() => setListOpen(false)} aria-label="Đóng danh sách"><X size={18}/></button>
        <label className="gis-search"><Search size={16}/><input aria-label="Tìm tỉnh thành trên bản đồ" type="search" placeholder="Tìm tên, mã, Saigon, TPHCM..." value={query} onChange={(e) => setQuery(e.target.value)}/></label>
        <div className="gis-type-filters" role="group" aria-label="Lọc loại địa phương">
          {([ ["all", "Tất cả"], ["province", "Tỉnh"], ["city", "Thành phố"] ] as const).map(([value,label]) =>
            <button key={value} type="button" className={typeFilter === value ? "active" : ""} aria-pressed={typeFilter === value} onClick={() => setTypeFilter(value)}>{label}</button>)}
        </div>
        <div className="gis-region-list" ref={listRef}>
          {shown.map((province) => <button key={province.code} data-province-code={province.code} type="button"
            className={`gis-region-row ${activeCodes.includes(province.code) ? "active" : ""}`}
            aria-pressed={activeCodes.includes(province.code)} onClick={() => select(province.code)}>
            <span className="gis-region-dot"/><span className="gis-region-text"><strong>{province.name}</strong><small>{province.kind} · Mã {province.code}</small></span>
            {dataset && !matchedCodes.has(province.code) ? <span title="Chưa ghép ranh giới GIS" className="gis-unmapped">!</span> : <ChevronRight size={16}/>}
          </button>)}
          {!shown.length && <div className="gis-empty">Không tìm thấy địa phương phù hợp.</div>}
        </div>
        <LicensePlateLookup period={period} onSelectProvince={select}/>
        <div className="gis-list-count">Hiển thị {shown.length}/{provinces.length} tỉnh/thành · {matchedCodes.size} vùng GIS đối chiếu</div>
      </aside>
      <div className="gis-map-column">
        <div className="gis-map-shell">
          <div ref={containerRef} className="gis-map-canvas" role="application" aria-label={`Bản đồ ${PERIODS[period].provinceCount} tỉnh/thành Việt Nam`}/>
          <div className="gis-map-top"><span><Compass size={15}/> {PERIODS[period].label}</span><span>{mapReady ? `${dataset?.metadata.matchedCount ?? 0}/${provinces.length} vùng đối chiếu` : "Đang chuẩn bị"}</span></div>
          <div className="gis-map-actions" aria-label="Điều khiển bản đồ">
            <button type="button" title="Phóng to" aria-label="Phóng to" disabled={!mapReady} onClick={() => mapRef.current?.zoomIn({ duration: 240 })}><Plus size={19}/></button>
            <button type="button" title="Thu nhỏ" aria-label="Thu nhỏ" disabled={!mapReady} onClick={() => mapRef.current?.zoomOut({ duration: 240 })}><Minus size={19}/></button>
            <button type="button" title="Xem toàn Việt Nam" aria-label="Đặt lại bản đồ" disabled={!mapReady} onClick={reset}><Focus size={18}/></button>
            <button type="button" title="Bật/tắt nhãn tỉnh thành" aria-label="Bật tắt nhãn địa phương" disabled={!mapReady} onClick={() => {
              const next = !showNames; showNamesRef.current = next; setShowNames(next); mapRef.current?.setLayoutProperty(LAYER_LABEL, "visibility", next ? "visible" : "none");
            }}><Layers3 size={17}/></button>
          </div>
          <button type="button" className="gis-mobile-list-trigger" aria-expanded={listOpen} onClick={() => setListOpen((x) => !x)}><Search size={16}/> {listOpen ? "Ẩn danh sách" : "Chọn tỉnh/thành"}</button>
          {loading && <div className="gis-map-status" role="status"><LoaderCircle size={28} className="gis-spin"/><strong>Đang tải bản đồ GIS…</strong><small>Chuẩn bị các vùng địa giới {PERIODS[period].label.toLowerCase()}</small></div>}
          {error && <div className="gis-map-status gis-map-error" role="alert"><ShieldAlert size={28}/><strong>Chưa thể hiển thị ranh giới</strong><small>{error}</small><button type="button" onClick={() => setRequestId((n) => n+1)}><RotateCcw size={15}/> Thử tải lại</button></div>}
          {!loading && !error && !selected && <div className="gis-map-hint"><MapPinned size={16}/> Chạm vào một vùng địa lý để xem địa giới</div>}
          {grouped && !loading && <div className="gis-history-hint"><GitMerge size={15}/> {groupRows.length} tỉnh/thành tiền thân đang được chọn</div>}
          <div className="gis-map-credits">GIS tham khảo · Không thay thế bản đồ pháp lý</div>
        </div>
        {active && <div className="gis-mobile-selection-bar" role="region" aria-label="Địa phương đang chọn">
          <div className="gis-mobile-selected-copy"><span>ĐÃ CHỌN TRÊN BẢN ĐỒ</span><strong>{grouped ? `${groupRows.length} tỉnh/thành tiền thân` : active.name}</strong></div>
          <button type="button" ref={detailTriggerRef} className="gis-mobile-view-detail" onClick={() => setDetailOpen(true)}><Info size={17}/> Xem chi tiết</button>
          <button type="button" className="gis-mobile-selection-clear" onClick={() => select(null)} aria-label="Bỏ chọn địa phương"><X size={17}/></button>
        </div>}
      </div>
      {listOpen && <button type="button" className="gis-mobile-scrim" aria-label="Đóng danh sách tỉnh/thành" onClick={() => setListOpen(false)}/>}
      <aside className={`gis-info-panel ${active ? "has-selection" : ""} ${detailOpen ? "gis-detail-open" : ""}`} aria-live="polite"
        role={detailOpen && active ? "dialog" : undefined} aria-modal={detailOpen && active ? true : undefined}
        aria-label={detailOpen && active ? `Chi tiết ${active.name}` : undefined}>
        {active ? <>
          <div className="gis-mobile-modal-header"><div><span>CHI TIẾT ĐỊA PHƯƠNG</span><h2>{grouped ? `${groupRows.length} tỉnh/thành tiền thân` : active.name}</h2></div>
            <button ref={detailCloseRef} type="button" aria-label="Đóng chi tiết, trở lại bản đồ" onClick={closeDetails}><X size={21}/></button></div>
          {onExploreCommunes && <div className="gis-mobile-modal-action"><button type="button" onClick={() => { setDetailOpen(false); onExploreCommunes(); }}><Layers3 size={18}/> {period === "current" ? "Xem xã/phường trên bản đồ" : "Tra cứu xã/phường cũ"} <ChevronRight size={18}/></button></div>}
          <div className="gis-info-top"><span><Info size={16}/> {grouped ? "NHÓM TỈNH TIỀN THÂN" : "ĐỊA PHƯƠNG ĐÃ CHỌN"}</span><button type="button" title="Bỏ chọn" aria-label="Bỏ chọn" onClick={() => select(null)}><X size={18}/></button></div>
          <div className="gis-info-name"><span className="gis-info-accent"/><h3>{grouped ? `${groupRows.length} tỉnh/thành trước sáp nhập` : active.name}</h3><p>{PERIODS[period].label}</p></div>
          {grouped ? <div className="gis-history-members" aria-label="Các tỉnh thành tiền thân">
            {groupRows.map((province, index) => <button key={province.code} type="button" onClick={() => select(province.code)}>
              <span className="gis-history-color" style={{ background: HISTORY_COLORS[index % HISTORY_COLORS.length] }}/>
              <span><strong>{province.name}</strong><small>Mã {province.code} · Chọn để xem riêng</small></span><ChevronRight size={15}/>
            </button>)}
            <button type="button" className="gis-history-fit" disabled={!matched.length} onClick={() => focusFeatures(matched)}><Focus size={15}/> Xem toàn bộ vùng đã chọn</button>
          </div> : <>
            <div className="gis-info-stat"><small>Mã hành chính</small><strong>{active.code}</strong></div>
            <div className="gis-info-stat"><small>Đơn vị hành chính cấp xã</small><strong>{active.communeCount.toLocaleString("vi-VN")}</strong><p>Theo danh mục thời kỳ đang xem.</p></div>
          </>}
          <div className="gis-info-stat"><small>Ranh giới GIS</small><strong>{allMapped ? "Đã ghép đầy đủ vùng" : "Chưa xác nhận đầy đủ vùng"}</strong><p>{allMapped ? "Các vùng đang chọn được làm sáng; các vùng khác làm tối." : "Danh mục sáp nhập vẫn tra cứu được, nhưng GIS có thể thiếu vùng đối chiếu."}</p></div>
          <div className="gis-history-switch"><button type="button" onClick={() => changePeriod(period === "before" ? "current" : "before")}><GitMerge size={15}/>{period === "current" ? "Xem các tỉnh/thành tiền thân" : "Xem địa phương hiện tại"}</button></div>
          <div className="verified-group">{grouped ? groupRows.map((row) => <div key={row.code}><h4>{row.name}</h4><VerifiedStatisticsPanel period={period} provinceCode={row.code} dense/></div>) : <VerifiedStatisticsPanel period={period} provinceCode={active.code} dense/>}</div>
          <div className="gis-info-share"><button type="button" onClick={() => { void shareSelection(); }}><Share2 size={15}/> Chia sẻ bản đồ</button>{shareStatus && <span role="status"><Check size={13}/>{shareStatus}</span>}</div>
          {onExploreCommunes && <div className="gis-history-switch gis-desktop-commune-action"><button type="button" onClick={onExploreCommunes}><Layers3 size={15}/> {period === "current" ? "Xem xã/phường trực tiếp trên bản đồ" : "Tra cứu xã/phường cũ"}</button></div>}
          <Link href={provinceHref("/tinh-thanh", period, active.code)} className="gis-info-link">Tra cứu đơn vị cấp xã <ArrowUpRight size={15}/></Link>
        </> : <div className="gis-info-idle"><div className="gis-info-visual"><MapPinned size={34}/></div><h3>Khám phá một địa phương</h3><p>Chọn tỉnh/thành, sau đó chuyển thời kỳ để xem những vùng trước và sau sáp nhập.</p><span><Info size={15}/> Vùng ngoài được làm tối khi chọn.</span></div>}
        {dataset && <div className="gis-source-note"><Database size={15}/><div><strong>Nguồn địa giới tham khảo</strong><p>{dataset.metadata.source.includes("pispace") ? "Natural Earth / PiSpace Maps" : dataset.metadata.source.includes("GeoVN") ? "GeoVN / Vietnamese Provinces Database" : "Nguồn GeoJSON công khai"}</p><p>Đã ghép {dataset.metadata.matchedCount}/{dataset.metadata.expected} tỉnh/thành. {dataset.metadata.matchedCount < dataset.metadata.expected ? "Một số vùng cần đối chiếu." : "Tên GIS đã đối chiếu danh mục."}</p></div></div>}
      </aside>
    </div>
    <div className="gis-underbar"><ShieldAlert size={15}/><span>Ranh giới GIS phục vụ giáo dục, chưa được nghiệm thu là địa giới pháp lý. Chuyển kỳ giữ góc nhìn; các tỉnh cũ chỉ được tô riêng khi nguồn dữ liệu có polygon tương ứng, không tự chia vùng ước lượng.</span></div>
  </section>;
}
