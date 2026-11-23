"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Compass, Database, Focus, Info, Layers3, LoaderCircle, MapPin, Minus, Plus, RotateCcw, Search, Share2, ShieldAlert, X } from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import type { ProvinceRow, UnitRow } from "@/lib/admin-data";
import { filterCommunes, type CommuneKindFilter } from "@/lib/commune-search";
import { useAtlas } from "./app-shell";

const L = { source: "vw-communes", fill: "vw-communes-fill", dim: "vw-communes-dim", line: "vw-communes-line", labels: "vw-communes-labels" };
const PALETTE = ["#99cadc", "#b4d4e2", "#87becb", "#9dcbd0", "#bddbe8"];
const cache = new Map<string, CommuneDataset>();
type GeoGeometry = { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
type CommuneFeature = { type: "Feature"; id: string; properties: { code: string; name: string; kind: string; provinceCode: string; tone: number; matched: boolean }; geometry: GeoGeometry };
type CommuneDataset = { type: "FeatureCollection"; features: CommuneFeature[]; metadata: {
  expected: number; matchedCount: number; geometryCount: number; missingCodes: string[]; unmatchedGeometryNames: string[];
  duplicateCodes: number; wrongProvinceCount: number; source: string; sourceDate: string; accuracy: string;
} };
type Catalog = { provinceCode: string; expected: number; rows: UnitRow[] };

type Bounds = [[number, number], [number, number]];
function getBounds(features: CommuneFeature[]): Bounds | null {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  function walk(node: unknown): void {
    if (!Array.isArray(node)) return;
    if (node.length >= 2 && typeof node[0] === "number" && typeof node[1] === "number") {
      const [x, y] = node as number[];
      if (Number.isFinite(x) && Number.isFinite(y)) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
      return;
    }
    for (const entry of node) walk(entry);
  }
  for (const feature of features) walk(feature.geometry.coordinates);
  return minX <= maxX && minY <= maxY ? [[minX, minY], [maxX, maxY]] : null;
}
function paintSelection(map: MapLibreMap, code: string | null) {
  if (!map.getLayer(L.fill)) return;
  map.setPaintProperty(L.fill, "fill-color", code
    ? ["case", ["==", ["get", "code"], code], "#2563eb", ["match", ["get", "tone"], 0, PALETTE[0], 1, PALETTE[1], 2, PALETTE[2], 3, PALETTE[3], PALETTE[4]]]
    : ["match", ["get", "tone"], 0, PALETTE[0], 1, PALETTE[1], 2, PALETTE[2], 3, PALETTE[3], PALETTE[4]]);
  map.setPaintProperty(L.dim, "fill-opacity", code ? ["case", ["==", ["get", "code"], code], 0, 0.57] : 0);
  map.setPaintProperty(L.line, "line-color", code ? ["case", ["==", ["get", "code"], code], "#ffffff", "#b8cbd3"] : "#ffffff");
  map.setPaintProperty(L.line, "line-width", code ? ["case", ["==", ["get", "code"], code], 2.9, 0.95] : 0.95);
  map.setPaintProperty("vw-communes-background", "background-color", code ? "#132c3b" : "#e8f5f9");
}
function isError(error: unknown): error is Error { return error instanceof Error; }
function message(error: unknown) { return isError(error) ? error.message : "Không thể tải dữ liệu."; }

export function CommuneMapWorkbench({
  province, provinces, selectedWardCode, onSelectWard, onChooseProvince, onBack,
}: { province: ProvinceRow; provinces: ProvinceRow[]; selectedWardCode: string | null;
  onSelectWard: (code: string | null) => void; onChooseProvince: (code: string) => void; onBack: () => void;
}) {
  const { period } = useAtlas();
  const provinceCode = province.code;
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const chooseRef = useRef(onSelectWard);
  const listRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [dataset, setDataset] = useState<CommuneDataset | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [gisError, setGisError] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [gisLoading, setGisLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<CommuneKindFilter>("all");
  const [listOpen, setListOpen] = useState(false);
  const [retry, setRetry] = useState(0);
  const [shareStatus, setShareStatus] = useState("");
  const [showLabels, setShowLabels] = useState(true);
  const labelRef = useRef(true);

  useEffect(() => { chooseRef.current = onSelectWard; }, [onSelectWard]);
  const rows = useMemo(() => catalog?.provinceCode === provinceCode ? catalog.rows : [], [catalog, provinceCode]);
  const shown = useMemo(() => filterCommunes(rows, query, kind), [rows, query, kind]);
  const selected = rows.find((row) => row.code === selectedWardCode) ?? null;
  const matchedCodes = useMemo(() => new Set(dataset?.features.filter((feature) => feature.properties.matched).map((feature) => feature.properties.code) ?? []), [dataset]);
  const mapped = !!selected && matchedCodes.has(selected.code);
  const focused = useCallback((features: CommuneFeature[], duration = 450) => {
    const bounds = getBounds(features);
    if (bounds && mapRef.current) mapRef.current.fitBounds(bounds, {
      padding: window.innerWidth <= 760 ? { top: 42, bottom: 108, left: 32, right: 32 } : { top: 52, bottom: 52, left: 64, right: 64 },
      maxZoom: 12.5, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration,
    });
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;
    let cancelled = false;
    async function init() {
      try {
        const gl = await import("maplibre-gl");
        if (cancelled || !mapContainer.current) return;
        const map = new gl.Map({
          container: mapContainer.current,
          style: { version: 8, glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf", sources: {},
            layers: [{ id: "vw-communes-background", type: "background", paint: { "background-color": "#e8f5f9" } }] },
          center: [106.1, 16.6], zoom: 5.5, minZoom: 3.5, maxZoom: 14,
          maxBounds: [[97.1, 2.5], [121.5, 28.5]], renderWorldCopies: false,
          attributionControl: false,
        });
        mapRef.current = map;
        map.on("load", () => {
          if (cancelled) return;
          map.addSource(L.source, { type: "geojson", promoteId: "code", data: { type: "FeatureCollection", features: [] } });
          map.addLayer({ id: L.fill, type: "fill", source: L.source, paint: { "fill-color": ["match", ["get", "tone"], 0, PALETTE[0], 1, PALETTE[1], 2, PALETTE[2], 3, PALETTE[3], PALETTE[4]], "fill-opacity": ["case", ["==", ["get", "matched"], true], 0.95, 0.22], "fill-color-transition": { duration: 260 } } });
          map.addLayer({ id: L.dim, type: "fill", source: L.source, paint: { "fill-color": "#071a2c", "fill-opacity": 0, "fill-opacity-transition": { duration: 260 } } });
          map.addLayer({ id: L.line, type: "line", source: L.source, paint: { "line-color": "#fff", "line-width": 0.95 } });
          map.addLayer({ id: L.labels, type: "symbol", source: L.source, minzoom: 8, layout: {
            "text-field": ["case", ["get", "matched"], ["get", "name"], ""], "text-size": 11,
            "text-font": ["Open Sans Regular"], "text-max-width": 8, "text-allow-overlap": false,
            "visibility": labelRef.current ? "visible" : "none",
          }, paint: { "text-color": "#21475c", "text-halo-color": "#e8f5f9", "text-halo-width": 1.1 } });
          map.on("mouseenter", L.fill, () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", L.fill, () => { map.getCanvas().style.cursor = "grab"; });
          map.on("click", L.fill, (event) => {
            const feature = event.features?.[0];
            const code = feature?.properties?.code;
            if (typeof code === "string" && feature?.properties?.matched === true) chooseRef.current(code);
          });
          map.on("click", (event) => {
            if (!map.queryRenderedFeatures(event.point, { layers: [L.fill] }).length) chooseRef.current(null);
          });
          setMapReady(true);
        });
        map.on("error", (event) => console.warn("VietWards Commune MapLibre:", event.error));
      } catch (error) { if (!cancelled) { setGisLoading(false); setGisError(`Không thể tạo bản đồ: ${message(error)}`); } }
    }
    void init();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // Catalog must continue working even when the GIS provider is unreachable.
  useEffect(() => {
    const controller = new AbortController();
    const frame = requestAnimationFrame(() => {
      setCatalog(null); setCatalogError(""); setCatalogLoading(true); setQuery(""); setKind("all"); setListOpen(false);
      fetch(`/api/communes?province=${encodeURIComponent(provinceCode)}`, { signal: controller.signal })
        .then(async (res) => { if (!res.ok) throw new Error("Không thể tải danh mục hành chính"); return res.json() as Promise<Catalog>; })
        .then((data) => { if (!controller.signal.aborted) setCatalog(data); })
        .catch((error) => { if (!controller.signal.aborted) setCatalogError(message(error)); })
        .finally(() => { if (!controller.signal.aborted) setCatalogLoading(false); });
    });
    return () => { controller.abort(); cancelAnimationFrame(frame); };
  }, [provinceCode]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const controller = new AbortController();
    const frame = requestAnimationFrame(() => {
      setDataset(null); setGisError(""); setGisLoading(true); lastFocused.current = null;
      (mapRef.current?.getSource(L.source) as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features: [] });
      const cached = cache.get(provinceCode);
      const work: Promise<CommuneDataset> = cached ? Promise.resolve(cached) :
        fetch(`/api/commune-boundaries?province=${encodeURIComponent(provinceCode)}`, { signal: controller.signal })
          .then(async (res) => { if (!res.ok) { const error = await res.json().catch(() => ({})) as { error?: string }; throw new Error(error.error ?? `HTTP ${res.status}`); } return res.json() as Promise<CommuneDataset>; });
      void work.then((data) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data.features) || data.metadata.matchedCount < 1) throw new Error("Không đối chiếu được dữ liệu GIS.");
        cache.set(provinceCode, data);
        const source = mapRef.current?.getSource(L.source) as GeoJSONSource | undefined;
        if (!source) throw new Error("Nguồn bản đồ chưa sẵn sàng.");
        source.setData({ type: "FeatureCollection", features: data.features } as unknown as Parameters<GeoJSONSource["setData"]>[0]);
        setDataset(data);
        focused(data.features.filter((f) => f.properties.matched), 0);
      }).catch((error) => { if (!controller.signal.aborted) setGisError(message(error)); })
        .finally(() => { if (!controller.signal.aborted) setGisLoading(false); });
    });
    return () => { controller.abort(); cancelAnimationFrame(frame); };
  }, [mapReady, provinceCode, retry, focused]);

  useEffect(() => {
    if (!mapReady) return;
    const code = selectedWardCode && matchedCodes.has(selectedWardCode) ? selectedWardCode : null;
    const map = mapRef.current;
    if (!map) return;
    paintSelection(map, code);
    if (code && dataset && lastFocused.current !== `${provinceCode}:${code}`) {
      const feature = dataset.features.find((f) => f.properties.code === code && f.properties.matched);
      if (feature) { lastFocused.current = `${provinceCode}:${code}`; focused([feature]); }
    }
    if (!code) lastFocused.current = null;
  }, [selectedWardCode, dataset, matchedCodes, provinceCode, mapReady, focused]);

  useEffect(() => {
    if (!selectedWardCode || catalog?.provinceCode !== provinceCode) return;
    if (!catalog.rows.some((ward) => ward.code === selectedWardCode)) onSelectWard(null);
  }, [selectedWardCode, catalog, provinceCode, onSelectWard]);

  useEffect(() => {
    const node = listRef.current;
    if (!node || !selectedWardCode || query) return;
    const row = [...node.querySelectorAll<HTMLButtonElement>("[data-ward-code]")]
      .find((item) => item.dataset.wardCode === selectedWardCode);
    if (row) node.scrollTo({ top: Math.max(0, row.offsetTop - node.offsetTop - node.clientHeight / 2), behavior: "smooth" });
  }, [selectedWardCode, query, catalog]);

  const choose = (code: string | null) => { onSelectWard(code); if (code) setListOpen(false); };
  const reset = () => {
    choose(null);
    if (dataset) focused(dataset.features.filter((f) => f.properties.matched));
  };
  async function share() {
    const url = new URL(window.location.href).toString();
    try {
      if (navigator.share && window.matchMedia("(max-width: 680px)").matches) {
        await navigator.share({ title: `VietWards · ${selected?.name ?? province.name}`, url });
        setShareStatus("Đã mở bảng chia sẻ");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("Đã sao chép liên kết");
      } else setShareStatus("Sao chép URL từ thanh địa chỉ để chia sẻ");
    } catch (error) { if ((error as Error)?.name !== "AbortError") setShareStatus("Chưa chia sẻ được liên kết"); }
  }
  const warning = dataset && dataset.metadata.matchedCount < dataset.metadata.expected;
  const sourceLabel = dataset?.metadata.source.includes("GeoVN") ? "GeoVN (GIS tham khảo, tháng 3/2026)" : "Nguồn GIS tham khảo";

  return <section className="gis-workbench commune-workbench" aria-label={`Bản đồ xã phường ${province.name}`}>
    <header className="gis-toolbar commune-toolbar">
      <div className="gis-toolbar-copy"><span className="gis-overline"><span className="live-dot"/> KHÁM PHÁ CẤP XÃ</span>
        <h2>{province.name} — Xã, phường, đặc khu</h2><p>Chạm vùng địa lý hoặc chọn trong danh sách để xem ranh giới từng đơn vị.</p>
      </div>
      <div className="commune-toolbar-actions">
        <button type="button" className="commune-back" onClick={onBack}><ArrowLeft size={16}/> Cấp tỉnh</button>
        <label className="commune-province-select"><span>Đổi tỉnh/thành</span><select aria-label="Chọn tỉnh thành để xem cấp xã" value={provinceCode} onChange={(e) => onChooseProvince(e.target.value)}>
          {provinces.map((row) => <option key={row.code} value={row.code}>{row.name}</option>)}
        </select></label>
      </div>
    </header>
    {period !== "current" && <p role="alert" className="commune-notice">Bản đồ cấp xã trước 01/07/2025 sẽ được triển khai tại V0.7.0.</p>}
    <div className="gis-layout">
      <aside className={`gis-region-panel ${listOpen ? "gis-list-open" : ""}`}>
        <div className="gis-panel-head"><div><Layers3 size={17}/><strong>Xã / phường / đặc khu</strong></div><span>{catalog?.expected ?? province.communeCount}</span></div>
        <button type="button" className="gis-mobile-list-close" aria-label="Đóng danh sách" onClick={() => setListOpen(false)}><X size={18}/></button>
        <label className="gis-search"><Search size={16}/><input type="search" aria-label="Tìm xã phường theo tên hoặc mã" placeholder="Tên xã/phường, mã 5 số..." value={query} onChange={(e) => setQuery(e.target.value)}/></label>
        <div className="gis-type-filters" role="group" aria-label="Lọc loại đơn vị cấp xã">
          {([ ["all", "Tất cả"], ["Xã", "Xã"], ["Phường", "Phường"], ["Đặc khu", "Đặc khu"] ] as const).map(([value,label]) =>
            <button key={value} type="button" className={kind === value ? "active" : ""} aria-pressed={kind === value} onClick={() => setKind(value)}>{label}</button>)}
        </div>
        {catalogError && <p className="commune-notice" role="alert">{catalogError}</p>}
        <div className="gis-region-list" ref={listRef}>
          {catalogLoading && <div className="gis-empty">Đang tải danh mục cấp xã…</div>}
          {!catalogLoading && shown.map((ward) => <button key={ward.code} type="button" data-ward-code={ward.code}
            className={`gis-region-row ${selectedWardCode === ward.code ? "active" : ""}`} aria-pressed={selectedWardCode === ward.code} onClick={() => choose(ward.code)}>
            <span className="gis-region-dot"/><span className="gis-region-text"><strong>{ward.name}</strong><small>Mã {ward.code} · {ward.kind}{ward.reclassified ? " · Đổi loại hình 2026" : ""}</small></span>
            {dataset && !matchedCodes.has(ward.code) ? <span className="gis-unmapped" title="Chưa có polygon đối chiếu">!</span> : <ChevronRight size={16}/>}
          </button>)}
          {!catalogLoading && !catalogError && !shown.length && <div className="gis-empty">Không tìm thấy xã/phường phù hợp.</div>}
        </div>
        <div className="gis-list-count">Hiển thị {shown.length}/{rows.length} đơn vị · {matchedCodes.size} vùng có GIS</div>
      </aside>
      <div className="gis-map-column"><div className="gis-map-shell">
        <div ref={mapContainer} className="gis-map-canvas" role="application" aria-label={`Bản đồ ranh giới cấp xã ${province.name}`}/>
        <div className="gis-map-top"><span><Compass size={15}/> {province.name}</span><span>{dataset ? `${dataset.metadata.matchedCount}/${rows.length || dataset.metadata.expected} vùng GIS` : "Cấp xã hiện hành"}</span></div>
        <div className="gis-map-actions" aria-label="Điều khiển bản đồ cấp xã">
          <button type="button" aria-label="Phóng to" title="Phóng to" disabled={!mapReady} onClick={() => mapRef.current?.zoomIn({ duration: 220 })}><Plus size={19}/></button>
          <button type="button" aria-label="Thu nhỏ" title="Thu nhỏ" disabled={!mapReady} onClick={() => mapRef.current?.zoomOut({ duration: 220 })}><Minus size={19}/></button>
          <button type="button" aria-label="Xem toàn tỉnh" title="Xem toàn tỉnh" disabled={!dataset} onClick={reset}><Focus size={18}/></button>
          <button type="button" aria-label="Bật tắt nhãn xã phường" title="Nhãn xã/phường" disabled={!mapReady} onClick={() => { const next = !showLabels; setShowLabels(next); labelRef.current = next; mapRef.current?.setLayoutProperty(L.labels, "visibility", next ? "visible" : "none"); }}><Layers3 size={17}/></button>
        </div>
        <button type="button" className="gis-mobile-list-trigger" aria-expanded={listOpen} onClick={() => setListOpen((value) => !value)}><Search size={16}/> {listOpen ? "Ẩn danh sách" : "Chọn xã/phường"}</button>
        {gisLoading && <div className="gis-map-status" role="status"><LoaderCircle className="gis-spin" size={28}/><strong>Đang tải ranh giới cấp xã…</strong><small>Chỉ tải GIS của {province.name}</small></div>}
        {!gisLoading && gisError && <div className="gis-map-status gis-map-error" role="alert"><ShieldAlert size={28}/><strong>Chưa có bản đồ cấp xã</strong><small>{gisError}</small><button type="button" onClick={() => setRetry((n) => n + 1)}><RotateCcw size={15}/> Thử tải lại</button></div>}
        {!gisLoading && !gisError && !selectedWardCode && <div className="gis-map-hint"><MapPin size={16}/> Chạm vào xã/phường để xem địa giới</div>}
        <div className="gis-map-credits">GIS tham khảo · Không thay thế bản đồ pháp lý</div>
      </div></div>
      {listOpen && <button type="button" className="gis-mobile-scrim" aria-label="Đóng danh sách xã phường" onClick={() => setListOpen(false)}/>}
      <aside className={`gis-info-panel ${selected ? "has-selection" : ""}`} aria-live="polite">
        {selected ? <><div className="gis-mobile-detail-grip" aria-hidden="true"/>
          <div className="gis-info-top"><span><Info size={16}/> ĐƠN VỊ HÀNH CHÍNH CẤP XÃ</span><button type="button" title="Bỏ chọn" aria-label="Bỏ chọn xã phường" onClick={() => choose(null)}><X size={18}/></button></div>
          <div className="gis-info-name"><span className="gis-info-accent"/><h3>{selected.name}</h3><p>{province.name}</p></div>
          <div className="gis-info-stat"><small>Mã hành chính</small><strong>{selected.code}</strong></div>
          <div className="gis-info-stat"><small>Loại đơn vị</small><strong>{selected.kind}</strong>{selected.reclassified && <p>Đã thay đổi loại hình năm 2026 theo dữ liệu V0.2.0.</p>}</div>
          <div className="gis-info-stat"><small>Hiệu lực thông tin hiện hành</small><strong>{selected.effectiveFrom}</strong></div>
          <div className="gis-info-stat"><small>Ranh giới địa lý</small><strong>{mapped ? "Đã ghép mã với polygon" : "Chưa có vùng GIS đối chiếu"}</strong><p>{mapped ? "Đang highlight vùng chọn; các vùng khác được làm tối." : "Danh mục vẫn đúng mã; không tự vẽ ranh giới khi thiếu polygon."}</p></div>
          <div className="gis-info-stat"><small>Diện tích và dân số</small><p>Dữ liệu có nguồn thống kê sẽ bổ sung ở V0.8.0.</p></div>
          <div className="gis-info-share"><button type="button" onClick={() => void share()}><Share2 size={15}/> Chia sẻ xã/phường</button>{shareStatus && <span role="status"><Check size={13}/>{shareStatus}</span>}</div>
        </> : <div className="gis-info-idle"><div className="gis-info-visual"><MapPin size={34}/></div><h3>Khám phá xã, phường</h3><p>Chọn trực tiếp trên bản đồ hoặc danh sách để xem tên, mã, loại đơn vị và ranh giới tham khảo.</p><span><Info size={15}/> Tải bản đồ theo từng tỉnh để tiết kiệm dữ liệu.</span></div>}
        {dataset && <div className="gis-source-note"><Database size={15}/><div><strong>{sourceLabel}</strong>
          <p>Đối chiếu {dataset.metadata.matchedCount}/{dataset.metadata.expected} mã cấp xã của tỉnh. Không phải ranh giới pháp lý.</p>
          {warning && <p role="status">Còn {dataset.metadata.missingCodes.length} mã chưa có polygon; không nội suy ranh giới.</p>}
        </div></div>}
      </aside>
    </div>
    <div className="gis-underbar"><ShieldAlert size={15}/><span>Ranh giới từ dữ liệu tham khảo GeoVN, chưa được nghiệm thu pháp lý; thay đổi tên/loại hình năm 2026 dùng danh mục hành chính theo mã. Lớp cấp xã trước sáp nhập thuộc V0.7.0.</span></div>
  </section>;
}
