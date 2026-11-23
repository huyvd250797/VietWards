"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, GitMerge, Layers3, MapPin, ShieldAlert } from "lucide-react";
import type { ProvinceRow } from "@/lib/admin-data";
import { useAtlas } from "./app-shell";
import { MapWorkbench } from "./map-stage";
import { CommuneMapWorkbench, type WardRelationTarget } from "./commune-explorer";
import type { AdminPeriod } from "@/lib/admin-data";

type RelationResponse = { targets: WardRelationTarget[]; status: string; unresolvedReferences: number; source: { name: string } };

/** Province and ward navigation have independent codes, but one shared period.
 * Switching snapshots keeps the commune-level view and offers all successor / source
 * candidates, never silently choosing a wrong result in a split-area case. */
export function MapExplorer({ previous, current }: { previous: ProvinceRow[]; current: ProvinceRow[] }) {
  const { period, ready, selectedProvinceCode, selectProvince, navigateProvince } = useAtlas();
  const [level, setLevel] = useState<"province" | "commune">("province");
  const [wardCode, setWardCode] = useState<string | null>(null);
  const [choices, setChoices] = useState<RelationResponse | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const lastPeriod = useRef<AdminPeriod>(period);
  const manualCrossPeriod = useRef<AdminPeriod | null>(null);
  const wardRef = useRef<string | null>(wardCode);
  const levelRef = useRef(level);
  useEffect(() => { wardRef.current = wardCode; levelRef.current = level; }, [wardCode, level]);
  const provinces = period === "before" ? previous : current;
  const activeProvince = provinces.find((p) => p.code === selectedProvinceCode) ?? null;

  const updateURL = useCallback((mode: "province" | "commune", ward: string | null, code: string | null, targetPeriod: AdminPeriod = period) => {
    if (typeof window === "undefined" || window.location.pathname !== "/ban-do") return;
    const url = new URL(window.location.href);
    if (mode === "commune" && code) {
      url.searchParams.set("period", targetPeriod);
      url.searchParams.set("province", code);
      url.searchParams.delete("group"); url.searchParams.delete("origin");
      url.searchParams.set("level", "commune");
      if (ward) url.searchParams.set("ward", ward); else url.searchParams.delete("ward");
    } else {
      url.searchParams.delete("level"); url.searchParams.delete("ward");
    }
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }, [period]);

  useEffect(() => {
    if (!ready) return;
    function restore() {
      const params = new URL(location.href).searchParams;
      const p = params.get("period") === "before" ? "before" : "current";
      const list = p === "before" ? previous : current;
      const active = params.get("level") === "commune" && list.some((item) => item.code === params.get("province"));
      setLevel(active ? "commune" : "province");
      const candidate = params.get("ward");
      setWardCode(active && candidate && /^\d{5}$/.test(candidate) ? candidate : null);
      setChoices(null);
    }
    const frame = requestAnimationFrame(restore);
    window.addEventListener("popstate", restore);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("popstate", restore); };
  }, [ready, previous, current]);

  useEffect(() => {
    const from = lastPeriod.current;
    if (from === period) return;
    lastPeriod.current = period;
    if (manualCrossPeriod.current === period) { manualCrossPeriod.current = null; return; }
    if (levelRef.current !== "commune") return;
    if (selectedProvinceCode) updateURL("commune", null, selectedProvinceCode, period);
    const fromWard = wardRef.current;
    const frame = requestAnimationFrame(() => { setWardCode(null); setChoices(null); setTransitionNote(""); });
    if (!fromWard || !selectedProvinceCode) return () => cancelAnimationFrame(frame);
    const controller = new AbortController();
    fetch(`/api/ward-relations?period=${from}&code=${fromWard}`, { signal: controller.signal })
      .then(async (r) => { if (!r.ok) throw new Error("Chưa lấy được quan hệ kế thừa."); return r.json() as Promise<RelationResponse>; })
      .then((relation) => {
        if (controller.signal.aborted) return;
        if (relation.targets.length === 1 && !relation.unresolvedReferences) {
          const target = relation.targets[0];
          navigateProvince(period, target.provinceCode);
          setWardCode(target.code);
          updateURL("commune", target.code, target.provinceCode, period);
          setTransitionNote(`Đã chuyển từ ${relation.source.name} sang ${target.name}.`);
        } else {
          setChoices(relation);
          setTransitionNote(relation.targets.length
            ? "Địa giới liên quan nhiều đơn vị. Hãy chọn đúng đơn vị trong danh sách; không tự suy đoán phần diện tích được chuyển."
            : "Chưa có mã cấp xã đối ứng đã xác định. Xem quan hệ trong danh mục; không suy đoán ranh giới.");
        }
      }).catch((error) => { if (!controller.signal.aborted) setTransitionNote(error instanceof Error ? error.message : "Không truy xuất được quan hệ."); });
    return () => { cancelAnimationFrame(frame); controller.abort(); };
  // Executed specifically when the administrative period changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const enterCommunes = () => {
    if (!activeProvince) return;
    setWardCode(null); setChoices(null); setTransitionNote(""); setLevel("commune");
    updateURL("commune", null, activeProvince.code);
  };
  const back = () => { setLevel("province"); setWardCode(null); setChoices(null); setTransitionNote(""); updateURL("province", null, selectedProvinceCode); };
  const chooseWard = (code: string | null) => {
    setWardCode(code); setChoices(null); setTransitionNote("");
    updateURL("commune", code, selectedProvinceCode);
  };
  const chooseProvince = (code: string) => {
    selectProvince(code); setWardCode(null); setChoices(null); setTransitionNote("");
    updateURL("commune", null, code);
  };
  const navigateToRelated = (targetPeriod: AdminPeriod, target: WardRelationTarget) => {
    manualCrossPeriod.current = targetPeriod;
    navigateProvince(targetPeriod, target.provinceCode);
    setLevel("commune"); setWardCode(target.code); setChoices(null); setTransitionNote("");
    updateURL("commune", target.code, target.provinceCode, targetPeriod);
  };

  return <div className="map-explorer">
    <div className="map-level-switch" role="group" aria-label="Chọn cấp hành chính trên bản đồ">
      <button type="button" className={level === "province" ? "active" : ""} aria-pressed={level === "province"} onClick={back}><Layers3 size={16}/> Cấp tỉnh/thành</button>
      <button type="button" className={level === "commune" ? "active" : ""} aria-pressed={level === "commune"} onClick={enterCommunes}
        disabled={!activeProvince} title={!activeProvince ? "Chọn một tỉnh/thành trước" : "Khám phá xã, phường và thị trấn"}>
        <MapPin size={16}/> Cấp xã/phường
      </button>
      <span>{!activeProvince ? "Chọn tỉnh/thành trên bản đồ trước" : `${activeProvince.name} · ${period === "before" ? "63 tỉnh, 3 cấp" : "34 tỉnh, 2 cấp"}`}</span>
    </div>
    {level === "commune" && choices && <div className="legacy-relation-choices" role="group" aria-label="Các đơn vị kế thừa hoặc tiền thân">
      <div><GitMerge size={18}/><strong>{choices.source.name} — các địa phương liên quan</strong></div>
      <p>{transitionNote}</p>
      <div className="legacy-choice-list">{choices.targets.map((target) =>
        <button type="button" key={target.code} onClick={() => navigateToRelated(period, target)}>
          {target.name} <small>Mã {target.code}{target.partial ? " · Có điều chỉnh một phần" : ""}</small>
        </button>)}</div>
      {choices.unresolvedReferences > 0 && <p>Đang có {choices.unresolvedReferences} tham chiếu chưa xác minh mã xã; không tự tạo vị trí trên bản đồ.</p>}
    </div>}
    {level === "commune" && !choices && transitionNote && <p className="commune-notice"><GitMerge size={15}/> {transitionNote}</p>}
    {level === "commune" && activeProvince ?
      <CommuneMapWorkbench key="commune-stage" province={activeProvince} provinces={provinces} selectedWardCode={wardCode}
        onSelectWard={chooseWard} onChooseProvince={chooseProvince} onBack={back} onNavigateRelation={navigateToRelated}/> :
      <MapWorkbench previous={previous} current={current} onExploreCommunes={enterCommunes}/>}
    {level === "commune" && !activeProvince && <p className="commune-notice" role="alert"><ShieldAlert size={16}/> Chưa xác định tỉnh/thành thuộc thời kỳ đã chọn. <button type="button" onClick={back}><ArrowLeft size={15}/> Trở về cấp tỉnh</button></p>}
  </div>;
}
