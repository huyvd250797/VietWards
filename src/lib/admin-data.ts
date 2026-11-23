/**
 * Canonical app-facing read model for two administrative snapshots.
 * Original 2025 tables remain immutable; 2026 category changes are layered on top.
 * All operations run on the server: do not transmit 10k rows into the client bundle.
 */
import * as old from "vn-local-divisions/legacy";
import * as now from "vn-local-divisions/current";
import * as conversion from "vn-local-divisions/convert";
import { DATA_CONTEXT } from "./admin-sources";

export type AdminPeriod = "before" | "current";
export type UnitRow = {
  id: string;
  code: string;
  name: string;
  kind: string;
  provinceCode: string;
  districtCode?: string;
  districtName?: string;
  sourceId: string;
  effectiveFrom: string;
  reclassified?: boolean;
};
export type ProvinceRow = {
  id: string;
  code: string;
  name: string;
  kind: string;
  communeCount: number;
  districtCount?: number;
  formerProvinces?: { code: string; name: string }[];
  successor?: { code: string; name: string } | null;
  sourceId: string;
};

const CITY_CHANGES: Record<string, { date: string; sourceId: string }> = {
  "Đồng Nai": { date: "2026-04-30", sourceId: "dong-nai-city-2026" },
  "Quảng Ninh": { date: "2026-09-01", sourceId: "quang-ninh-city-2026" },
  "Bắc Ninh": { date: "2026-09-20", sourceId: "bac-ninh-city-2026" },
};

/** Same territory, same government unit code; only its kind and name prefix changed. */
const WARD_CHANGES: Array<{ province: string; names: string[]; date: string; sourceId: string }> = [
  {
    province: "Đồng Nai", date: "2026-04-30", sourceId: "dong-nai-wards-2026",
    names: ["Trảng Bom", "Long Thành", "Trị An", "Nhơn Trạch", "Tân Khai", "Xuân Lộc", "Tân Phú", "Lộc Ninh", "Dầu Giây", "Đồng Phú"],
  },
  {
    province: "Bắc Ninh", date: "2026-09-20", sourceId: "bac-ninh-wards-2026",
    names: ["Yên Phong", "Tiên Du", "Chi Lăng", "Phù Lãng", "Lương Tài", "Gia Bình", "Nhân Thắng", "Hiệp Hòa", "Bố Hạ", "Lạng Giang", "Kép", "Lục Nam"],
  },
];

const normalizeName = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
const wardChangeIndex = new Map(WARD_CHANGES.flatMap((change) => change.names.map((name) => [`${normalizeName(change.province)}:${normalizeName(name)}`, { ...change, officialName: name }] as const)));
const cleanProvince = (name: string) => name.replace(/^(Tỉnh|Thành phố)\s+/, "");
const oldProvinces = old.getProvinces();
const currentProvinces = now.getProvinces();
const legacyDistricts = old.getDistricts();
const legacyWards = old.getWards();
const currentWards = now.getWards();

function counterBy<T>(items: T[], getKey: (row: T) => string): Map<string, number> {
  const tally = new Map<string, number>();
  for (const item of items) { const key = getKey(item); tally.set(key, (tally.get(key) ?? 0) + 1); }
  return tally;
}
const districtsByProvince = counterBy(legacyDistricts, (d) => d.provinceCode);
const legacyWardsByProvince = counterBy(legacyWards, (w) => w.provinceCode);
const currentWardsByProvince = counterBy(currentWards, (w) => w.provinceCode);
const legacyByProvince = Map.groupBy(legacyWards, (w) => w.provinceCode);
const currentByProvince = Map.groupBy(currentWards, (w) => w.provinceCode);
const districtByProvince = Map.groupBy(legacyDistricts, (d) => d.provinceCode);
const districtCommuneCounts = counterBy(legacyWards, (w) => w.districtCode);
const legacyByCode = new Map(legacyWards.map((w) => [w.code, w]));
const currentByCode = new Map(currentWards.map((w) => [w.code, w]));

function currentProvinceName(name: string): string {
  const short = cleanProvince(name);
  return CITY_CHANGES[short] ? `Thành phố ${short}` : name;
}
function currentWardDisplay(ward: (typeof currentWards)[number]): UnitRow {
  const province = currentProvinces.find((p) => p.code === ward.provinceCode);
  const change = ward.unit === "Xã" ? wardChangeIndex.get(`${normalizeName(cleanProvince(province?.name ?? ""))}:${normalizeName(ward.shortName)}`) : undefined;
  return {
    id: `current-ward:${ward.code}`,
    code: ward.code,
    name: change ? `Phường ${change.officialName}` : ward.name,
    kind: change ? "Phường" : ward.unit,
    provinceCode: ward.provinceCode,
    sourceId: change?.sourceId ?? "decision-19-2025",
    effectiveFrom: change?.date ?? DATA_CONTEXT.reorganizationFrom,
    reclassified: !!change,
  };
}

export function getProvinceRows(period: AdminPeriod): ProvinceRow[] {
  if (period === "before") return oldProvinces.map((province) => {
    const successor = conversion.provinceToCurrent(province.code);
    return {
      id: `before-province:${province.code}`, code: province.code, name: province.name, kind: province.unit,
      communeCount: legacyWardsByProvince.get(province.code) ?? 0,
      districtCount: districtsByProvince.get(province.code) ?? 0,
      successor: successor ? { code: successor.code, name: currentProvinceName(successor.name) } : null,
      sourceId: "gso-legacy",
    };
  });
  return currentProvinces.map((province) => ({
    id: `current-province:${province.code}`,
    code: province.code, name: currentProvinceName(province.name),
    kind: CITY_CHANGES[cleanProvince(province.name)] ? "Thành phố Trung ương" : province.unit,
    communeCount: currentWardsByProvince.get(province.code) ?? 0,
    formerProvinces: conversion.legacyProvincesOf(province.code).map((p) => ({ code: p.code, name: p.name })),
    sourceId: CITY_CHANGES[cleanProvince(province.name)]?.sourceId ?? "decision-19-2025",
  }));
}

export function getDistrictRows(provinceCode: string): Array<{ code: string; name: string; count: number }> {
  return (districtByProvince.get(provinceCode) ?? []).map((d) => ({
    code: d.code, name: d.name, count: districtCommuneCounts.get(d.code) ?? 0,
  }));
}

export function getUnitRows(period: AdminPeriod, provinceCode: string): UnitRow[] {
  if (period === "current") {
    const wards = provinceCode ? (currentByProvince.get(provinceCode) ?? []) : currentWards;
    return wards.map(currentWardDisplay);
  }
  const wards = provinceCode ? (legacyByProvince.get(provinceCode) ?? []) : legacyWards;
  return wards.map((ward) => ({
    id: `before-ward:${ward.code}`, code: ward.code, name: ward.name, kind: ward.unit,
    provinceCode: ward.provinceCode, districtCode: ward.districtCode,
    districtName: ward.districtName, sourceId: "gso-legacy",
    effectiveFrom: "2025-06-30",
  }));
}

export function getUnitByCode(period: AdminPeriod, code: string): UnitRow | null {
  if (period === "current") {
    const ward = currentByCode.get(code);
    return ward ? currentWardDisplay(ward) : null;
  }
  const ward = legacyByCode.get(code);
  return ward ? {
    id: `before-ward:${ward.code}`, code: ward.code, name: ward.name, kind: ward.unit,
    provinceCode: ward.provinceCode, districtCode: ward.districtCode,
    districtName: ward.districtName, sourceId: "gso-legacy", effectiveFrom: "2025-06-30",
  } : null;
}

export function getWardRelation(wardCode: string, period: AdminPeriod) {
  if (period === "before") {
    const result = conversion.wardToCurrent(wardCode);
    return { status: result.status, targets: result.candidates.map((w) => currentWardDisplay(w)), sourceId: "community-package" };
  }
  const sources = conversion.legacySourcesOf(wardCode);
  return {
    status: sources.some((s) => s.partial) ? "partial" : "exact",
    targets: sources.map((s) => ({
      code: s.ward?.code ?? s.district.code,
      name: s.ward?.name ?? s.district.name,
      parentName: s.district.name,
      partial: s.partial,
    })),
    sourceId: "community-package",
  };
}

export function getCatalogStats(period: AdminPeriod) {
  const rows = getProvinceRows(period);
  const count = period === "current" ? currentWards.length : legacyWards.length;
  return {
    period, provinceCount: rows.length, communeCount: count,
    districtCount: period === "before" ? legacyDistricts.length : 0,
    centralCities: rows.filter((row) => row.kind === "Thành phố Trung ương").length,
    effectiveDate: period === "before" ? DATA_CONTEXT.legacySnapshot : DATA_CONTEXT.currentSnapshot,
  };
}
