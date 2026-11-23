"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Layers3, MapPin } from "lucide-react";
import type { ProvinceRow } from "@/lib/admin-data";
import { useAtlas } from "./app-shell";
import { MapWorkbench } from "./map-stage";
import { CommuneMapWorkbench } from "./commune-explorer";

/** Maintains the commune drill-down while the canonical province state remains in AppShell.
 * The `level` / `ward` URL parameters are optional and always tied to `period=current`.
 */
export function MapExplorer({ previous, current }: { previous: ProvinceRow[]; current: ProvinceRow[] }) {
  const { period, ready, selectedProvinceCode, selectProvince } = useAtlas();
  const [level, setLevel] = useState<"province" | "commune">("province");
  const [wardCode, setWardCode] = useState<string | null>(null);
  const currentProvince = current.find((p) => p.code === selectedProvinceCode) ?? null;

  const updateURL = useCallback((mode: "province" | "commune", ward: string | null, provinceCode: string | null) => {
    if (typeof window === "undefined" || window.location.pathname !== "/ban-do") return;
    const url = new URL(window.location.href);
    if (mode === "commune" && period === "current" && provinceCode) {
      url.searchParams.set("period", "current");
      url.searchParams.set("province", provinceCode);
      url.searchParams.delete("provinces");
      url.searchParams.delete("origin");
      url.searchParams.set("level", "commune");
      if (ward) url.searchParams.set("ward", ward);
      else url.searchParams.delete("ward");
    } else {
      url.searchParams.delete("level"); url.searchParams.delete("ward");
    }
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }, [period]);

  useEffect(() => {
    if (!ready) return;
    function applyURL() {
      const params = new URL(window.location.href).searchParams;
      const active = params.get("level") === "commune" && params.get("period") === "current" &&
        current.some((row) => row.code === params.get("province"));
      setLevel(active ? "commune" : "province");
      const ward = params.get("ward");
      setWardCode(active && ward && /^\d{5}$/.test(ward) ? ward : null);
    }
    const frame = requestAnimationFrame(applyURL);
    window.addEventListener("popstate", applyURL);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("popstate", applyURL); };
  }, [ready, current]);

  useEffect(() => {
    if (period === "current" && currentProvince) return;
    const frame = requestAnimationFrame(() => { setLevel("province"); setWardCode(null); });
    return () => cancelAnimationFrame(frame);
  }, [period, currentProvince]);

  const enterCommunes = () => {
    if (period !== "current" || !currentProvince) return;
    setWardCode(null);
    setLevel("commune");
    updateURL("commune", null, currentProvince.code);
  };
  const back = () => { setLevel("province"); setWardCode(null); updateURL("province", null, selectedProvinceCode); };
  const chooseWard = (code: string | null) => { setWardCode(code); updateURL("commune", code, selectedProvinceCode); };
  const chooseProvince = (code: string) => {
    selectProvince(code);
    setWardCode(null);
    updateURL("commune", null, code);
  };

  return <div className="map-explorer">
    <div className="map-level-switch" role="group" aria-label="Chọn cấp hành chính trên bản đồ">
      <button type="button" className={level === "province" ? "active" : ""} aria-pressed={level === "province"} onClick={back}><Layers3 size={16}/> Cấp tỉnh/thành</button>
      <button type="button" className={level === "commune" ? "active" : ""} aria-pressed={level === "commune"}
        onClick={enterCommunes} disabled={period !== "current" || !currentProvince} title={period !== "current" ? "Cấp xã lịch sử sẽ có ở V0.7.0" : !currentProvince ? "Chọn một tỉnh/thành trước" : "Khám phá xã/phường"}>
        <MapPin size={16}/> Cấp xã/phường
      </button>
      <span>{period === "before" ? "Cấp xã lịch sử: V0.7.0" : !currentProvince ? "Chọn tỉnh/thành trên bản đồ trước" : currentProvince.name}</span>
    </div>
    {level === "commune" && period === "current" && currentProvince ?
      <CommuneMapWorkbench key="commune-stage" province={currentProvince} provinces={current}
        selectedWardCode={wardCode} onSelectWard={chooseWard} onChooseProvince={chooseProvince} onBack={back}/> :
      <MapWorkbench previous={previous} current={current} onExploreCommunes={enterCommunes}/>}
    {level === "commune" && (!currentProvince || period !== "current") && <button type="button" className="commune-back" onClick={back}><ArrowLeft size={15}/> Trở về bản đồ cấp tỉnh</button>}
  </div>;
}
