"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Compass, Database, Focus, Info, Layers3, LoaderCircle, MapPinned, Minus, Plus, RotateCcw, Search, Share2, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useAtlas, PeriodToggle } from "./app-shell";
import { PERIODS } from "@/lib/config";
import type { ProvinceRow } from "@/lib/admin-data";
import { provinceHref, searchProvinces, type ProvinceTypeFilter } from "@/lib/province-search";

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

function getBounds(feature: RegionFeature): [[number, number], [number, number]] {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  // Coordinates have two additional nestings for MultiPolygon. Visit only numeric [lon,lat] pairs.
  function walk(node: unknown) {
    if (!Array.isArray(node)) return;
    if (node.length >= 2 && typeof node[0] === "number" && typeof node[1] === "number") {
      const [x, y] = node as number[];
      if (Number.isFinite(x) && Number.isFinite(y)) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
      return;
    }
    node.forEach(walk);
  }
  walk(feature.geometry.coordinates);
  return minX <= maxX && minY <= maxY ? [[minX, minY], [maxX, maxY]] : VN_BOUNDS;
}

const LAYER_FILL = "vw-regions-fill";
const LAYER_DIM = "vw-regions-dim";
const LAYER_LINE = "vw-regions-lines";
const LAYER_LABEL = "vw-region-labels";
const SOURCE = "vw-regions";

function applySelection(map: MapLibreMap, selectedCode: string | null, prev: string | null) {
  if (!map.getSource(SOURCE)) return;
  if (prev) map.setFeatureState({ source: SOURCE, id: prev }, { selected: false });
  if (selectedCode) map.setFeatureState({ source: SOURCE, id: selectedCode }, { selected: true });
  map.setPaintProperty("vw-background", "background-color", selectedCode ? "#132c3b" : "#e8f5f9");
  map.setPaintProperty(LAYER_DIM, "fill-opacity", selectedCode
    ? ["case", ["boolean", ["feature-state", "selected"], false], 0, 0.57]
    : 0);
  map.setPaintProperty(LAYER_LINE, "line-width", selectedCode
    ? ["case", ["boolean", ["feature-state", "selected"], false], 2.8, 0.8]
    : 0.9);
  map.setPaintProperty(LAYER_LINE, "line-color", selectedCode
    ? ["case", ["boolean", ["feature-state", "selected"], false], "#11a4c7", "#c4d3db"]
    : "#ffffff");
  map.setPaintProperty(LAYER_LABEL, "text-color", selectedCode
    ? ["case", ["boolean", ["feature-state", "selected"], false], "#063647", "#d0dee4"]
    : "#224b62");
}

export function MapStage({ compact = false }: { compact?: boolean }) {
  const { period } = useAtlas();
  return <Link href="/ban-do" className={`map-stage gis-preview ${compact ? "map-stage-compact" : ""}`}>
    <div className="map-stage-top"><div className="map-stage-label"><span className="live-dot"/> KHÁM PHÁ BẢN ĐỒ</div><span className="map-stage-tag">GIS · V0.4.0</span></div>
    <div className="gis-preview-art" aria-hidden="true"><span className="gis-preview-grid"/><MapPinned size={72} strokeWidth={1.15}/><div className="gis-preview-orbit"/></div>
    <div className="gis-preview-copy"><span className="map-stage-eyebrow">BẢN ĐỒ TƯƠNG TÁC</span><h3>Khám phá từng vùng đất.</h3>
      <p>Chạm vào tỉnh/thành để làm nổi bật địa giới, khám phá ranh giới trước và sau sáp nhập.</p>
      <span className="gis-preview-chip"><Layers3 size={15}/> {PERIODS[period].label} · {PERIODS[period].provinceCount} tỉnh/thành</span>
      <span className="gis-preview-link">Mở bản đồ <ArrowUpRight size={17}/></span>
    </div>
  </Link>;
}

export function MapWorkbench({ previous, current }: { previous: ProvinceRow[]; current: ProvinceRow[] }) {
  const { period, ready, selectedProvinceCode: selected, selectProvince } = useAtlas();
  const provinces = period === "before" ? previous : current;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const dataRef = useRef<RegionDataset | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [dataset, setDataset] = useState<RegionDataset | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProvinceTypeFilter>("all");
  const [shareStatus, setShareStatus] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showNames, setShowNames] = useState(true);
  const showNamesRef = useRef(true);

  const select = useCallback((code: string | null) => {
    selectProvince(code);
    if (code) setListOpen(false);
  }, [selectProvince]);

  const reset = useCallback(() => {
    select(null);
    mapRef.current?.fitBounds(VN_BOUNDS, { padding: 16, duration: 500 });
  }, [select]);

  async function shareSelection() {
    if (!selected) return;
    const url = new URL(provinceHref("/ban-do", period, selected), window.location.origin).toString();
    try {
      if (navigator.share && window.matchMedia("(max-width: 680px)").matches) {
        await navigator.share({ title: "VietWards · Bản đồ hành chính", url });
        setShareStatus("Đã mở bảng chia sẻ");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("Đã sao chép liên kết");
      } else {
        setShareStatus("Trình duyệt không hỗ trợ sao chép tự động");
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") setShareStatus("Không thể chia sẻ. Hãy sao chép URL trên thanh địa chỉ.");
    }
  }

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const abort = new AbortController();
    const id = window.requestAnimationFrame(() => {
      // Ensure no stale selection leaks across independently sourced historical maps (V0.5 covers trans-period mapping).
      selectedRef.current = null;
      dataRef.current = null;
      setDataset(null);
      setLoading(true);
      setError("");
      setMapReady(false);
      setQuery("");
      setTypeFilter("all");
    });

    async function initialize() {
      try {
        const [maplibregl, response] = await Promise.all([
          import("maplibre-gl"),
          fetch(`/api/map-boundaries?period=${period}`, { signal: abort.signal }),
        ]);
        if (!response.ok) {
          const payload: {error?:string} = await response.json().catch(() => ({}));
          throw new Error(payload.error || `Không tải được GIS (HTTP ${response.status})`);
        }
        const geojson = await response.json() as RegionDataset;
        if (cancelled || !containerRef.current) return;
        if (geojson.features.length !== PERIODS[period].provinceCount) throw new Error("Số vùng trong GIS không khớp danh mục hành chính.");
        dataRef.current = geojson;
        setDataset(geojson);
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
          map.addSource(SOURCE, { type: "geojson", promoteId: "code", data: { type: "FeatureCollection", features: geojson.features } });
          map.addLayer({ id: LAYER_FILL, type: "fill", source: SOURCE, paint: {
            "fill-color": ["case", ["boolean", ["feature-state", "selected"], false], "#35d1c2", ["match", ["get", "tone"], 0, FILLS[0], 1, FILLS[1], 2, FILLS[2], 3, FILLS[3], FILLS[4]]],
            "fill-opacity": 0.98,
          } });
          map.addLayer({ id: LAYER_DIM, type: "fill", source: SOURCE, paint: { "fill-color": "#071a2c", "fill-opacity": 0 } });
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
              setQuery(""); setTypeFilter("all"); select(code);
            }
          });
          map.on("click", (event) => {
            if (!map.queryRenderedFeatures(event.point, { layers: [LAYER_FILL] }).length) select(null);
          });
          map.fitBounds(VN_BOUNDS, { padding: 12, duration: 0 });
          setMapReady(true);
          setLoading(false);
        });
        map.on("error", (evt) => {
          console.warn("VietWards map engine:", evt.error);
        });
      } catch (cause) {
        if (cancelled || abort.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Lỗi chưa xác định khi tải bản đồ.");
        setLoading(false);
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      abort.abort();
      window.cancelAnimationFrame(id);
      mapRef.current?.remove();
      mapRef.current = null;
      dataRef.current = null;
      selectedRef.current = null;
    };
  }, [period, requestId, select, ready]);

  // Selection is owned by AppShell; map, catalog and URL all observe this one value.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !map.getSource(SOURCE)) return;
    const feature = dataRef.current?.features.find((item) => item.properties.code === selected && item.properties.matched);
    const mappedCode = feature ? selected : null;
    applySelection(map, mappedCode, selectedRef.current);
    selectedRef.current = mappedCode;
    if (feature) {
      map.fitBounds(getBounds(feature), {
        padding: window.innerWidth < 800 ? 42 : { top: 56, bottom: 56, left: 70, right: 70 },
        maxZoom: 9.6, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
      });
    }
  }, [selected, mapReady, dataset]);

  const shown = useMemo(() => searchProvinces(provinces, query, typeFilter), [provinces, query, typeFilter]);
  const active = provinces.find((row) => row.code === selected) ?? null;
  const activeFeature = dataset?.features.find((feature) => feature.properties.code === selected && feature.properties.matched);
  const matchedCodes = useMemo(() => new Set(dataset?.features.filter((f) => f.properties.matched).map((f) => f.properties.code) ?? []), [dataset]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShareStatus(""));
    return () => window.cancelAnimationFrame(frame);
  }, [selected, period]);

  useEffect(() => {
    if (!listOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setListOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [listOpen]);

  useEffect(() => {
    const box = listRef.current;
    if (!box || !selected || query) return;
    const node = Array.from(box.querySelectorAll<HTMLButtonElement>("[data-province-code]"))
      .find((element) => element.dataset.provinceCode === selected);
    if (!node) return;
    const target = node.offsetTop - box.offsetTop - box.clientHeight / 2 + node.clientHeight / 2;
    box.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  }, [selected, query, period, dataset]);

  return <section className="gis-workbench" aria-label="Bản đồ địa giới tương tác">
    <header className="gis-toolbar">
      <div className="gis-toolbar-copy"><span className="gis-overline"><span className="live-dot"/> ĐỊA GIỚI TƯƠNG TÁC</span><h2>Bản đồ hành chính Việt Nam</h2><p>Chọn trực tiếp trên bản đồ hoặc chọn địa phương trong danh sách.</p></div>
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
          {shown.map((province) => <button key={province.code} data-province-code={province.code} type="button" className={`gis-region-row ${selected === province.code ? "active" : ""}`} aria-pressed={selected === province.code} onClick={() => select(province.code)}>
            <span className="gis-region-dot"/><span className="gis-region-text"><strong>{province.name}</strong><small>{province.kind} · Mã {province.code}</small></span>{dataset && !matchedCodes.has(province.code) ? <span title="Chưa ghép ranh giới GIS" className="gis-unmapped">!</span> : <ChevronRight size={16}/>}
          </button>)}
          {!shown.length && <div className="gis-empty">Không tìm thấy địa phương phù hợp.</div>}
        </div>
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
          <div className="gis-map-credits">GIS tham khảo · Không thay thế bản đồ pháp lý</div>
        </div>
      </div>
      {listOpen && <button type="button" className="gis-mobile-scrim" aria-label="Đóng danh sách tỉnh/thành" onClick={() => setListOpen(false)}/>}
      <aside className={`gis-info-panel ${active ? "has-selection" : ""}`} aria-live="polite">
        {active ? <>
          <div className="gis-mobile-detail-grip" aria-hidden="true"/>
          <div className="gis-info-top"><span><Info size={16}/> ĐỊA PHƯƠNG ĐÃ CHỌN</span><button type="button" title="Bỏ chọn" aria-label="Bỏ chọn" onClick={() => select(null)}><X size={18}/></button></div>
          <div className="gis-info-name"><span className="gis-info-accent"/><h3>{active.name}</h3><p>{active.kind} · {PERIODS[period].label}</p></div>
          <div className="gis-info-stat"><small>Mã hành chính</small><strong>{active.code}</strong></div>
          <div className="gis-info-stat"><small>Đơn vị hành chính cấp xã</small><strong>{active.communeCount.toLocaleString("vi-VN")}</strong><p>Số đơn vị theo danh mục hành chính của thời kỳ này.</p></div>
          <div className="gis-info-stat"><small>Ranh giới GIS</small><strong>{activeFeature ? "Đã ghép vùng bản đồ" : "Chưa xác nhận vùng bản đồ"}</strong><p>{activeFeature ? "Địa phương được làm sáng; các vùng khác tối đi." : "Có thể tra cứu danh mục nhưng chưa thể highlight khi thiếu dữ liệu GIS đối chiếu."}</p></div>
          <div className="gis-info-stat"><small>Diện tích · dân số · biển số</small><p>Dữ liệu có nguồn và kỳ thống kê sẽ bổ sung ở V0.8.0.</p></div>
          <div className="gis-info-share"><button type="button" onClick={() => { void shareSelection(); }}><Share2 size={15}/> Chia sẻ bản đồ</button>{shareStatus && <span role="status"><Check size={13}/>{shareStatus}</span>}</div>
          <Link href={provinceHref("/tinh-thanh", period, active.code)} className="gis-info-link">Tra cứu đơn vị cấp xã <ArrowUpRight size={15}/></Link>
        </> : <div className="gis-info-idle"><div className="gis-info-visual"><MapPinned size={34}/></div><h3>Khám phá một địa phương</h3><p>Bấm vào tỉnh/thành trên bản đồ để làm sáng toàn bộ ranh giới và hiển thị thông tin hành chính.</p><span><Info size={15}/> Vùng ngoài được làm tối khi chọn.</span></div>}
        {dataset && <div className="gis-source-note"><Database size={15}/><div><strong>Nguồn địa giới tham khảo</strong><p>{dataset.metadata.source.includes("pispace") ? "Natural Earth / PiSpace Maps" : dataset.metadata.source.includes("GeoVN") ? "GeoVN / Vietnamese Provinces Database" : "Nguồn GeoJSON công khai"}</p><p>Đã ghép mã {dataset.metadata.matchedCount}/{dataset.metadata.expected} tỉnh/thành. {dataset.metadata.matchedCount < dataset.metadata.expected ? "Một số tên GIS đang cần đối chiếu." : "Tên GIS đã đối chiếu danh mục."}</p></div></div>}
      </aside>
    </div>
    <div className="gis-underbar"><ShieldAlert size={15}/><span>Ranh giới là dữ liệu bản đồ tham khảo phục vụ học tập, chưa được nghiệm thu là ranh giới pháp lý. Chuyển kỳ sẽ đặt lại lựa chọn; hiển thị tách/gộp liên thời kỳ triển khai ở V0.5.0.</span></div>
  </section>;
}
