"use client";

import { ArrowUpRight, Layers3, MapPinned, MousePointer2, ScanLine, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAtlas, PeriodToggle } from "./app-shell";
import { PERIODS } from "@/lib/config";

export function MapStage({ compact = false }: { compact?: boolean }) {
  const { period } = useAtlas();
  return (
    <div className={`map-stage ${compact ? "map-stage-compact" : ""}`}>
      <div className="map-stage-top">
        <div className="map-stage-label"><span className="live-dot"/> CHẾ ĐỘ KHÁM PHÁ</div>
        <span className="map-stage-tag">GIS · V0.3.0</span>
      </div>
      <div className="map-art-bg" aria-hidden="true">
        <span className="map-grid"/>
        <span className="map-orbit orbit-one"/><span className="map-orbit orbit-two"/><span className="map-orbit orbit-three"/>
        <span className="map-pin pin-one"/><span className="map-pin pin-two"/><span className="map-pin pin-three"/>
        <span className="map-country-hint"/>
      </div>
      <div className="map-stage-content">
        <div className="map-icon"><MapPinned size={29}/></div>
        <div className="map-stage-eyebrow">KHÔNG GIAN ĐỊA LÝ</div>
        <h3>Bản đồ tương tác đang được chuẩn bị</h3>
        <p>Vùng ranh giới tỉnh/thành sẽ xuất hiện tại V0.3.0. Hiện tại đây là khung giao diện, <strong>chưa có dữ liệu GIS chính thức</strong>.</p>
        <div className="map-period-note"><Layers3 size={15}/> Chế độ đã chọn: <strong>{PERIODS[period].label}</strong> <span>· {PERIODS[period].provinceCount} tỉnh/thành</span></div>
      </div>
      <div className="map-stage-footer">
        <span><ShieldCheck size={16}/> Không sử dụng ranh giới chưa kiểm chứng</span>
        {!compact && <span><MousePointer2 size={15}/> Bấm chọn vùng khi có GIS <ArrowUpRight size={14}/></span>}
      </div>
    </div>
  );
}

export function MapWorkbench() {
  return (
    <div className="workbench-layout">
      <aside className="workbench-panel">
        <div className="mini-panel-head"><Layers3 size={18}/> <strong>Chế độ hành chính</strong></div>
        <PeriodToggle size="large"/>
        <div className="workbench-separator"/>
        <div className="workbench-empty">
          <ScanLine size={22}/>
          <h4>Danh sách vùng địa giới</h4>
          <p>Danh mục tỉnh/thành sẽ được bổ sung tại V0.2.0 và có thể chọn trực tiếp ở V0.4.0.</p>
          <Link href="/tinh-thanh">Xem kế hoạch danh mục <ArrowUpRight size={15}/></Link>
        </div>
      </aside>
      <MapStage/>
    </div>
  );
}
