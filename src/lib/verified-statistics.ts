/** Verified display model for V0.8.0.
 * Data transcription remains separate from canonical administrative ID tables.
 * Resolve by the administrative code FIRST, then use the authoritative name as a
 * lookup bridge. Never treat a plate prefix as an administrative code.
 */
import statisticsJson from "@/data/verified-province-statistics.json";
import sourcesJson from "@/data/verified-sources.json";
import { getProvinceRows, getUnitByCode, type AdminPeriod, type ProvinceRow } from "@/lib/admin-data";

export type VerifiedMetric = { status: "verified"; sourceId: string };
export type AreaMetric = VerifiedMetric & { valueKm2: number; referenceDate: string };
export type PopulationMetric = VerifiedMetric & {
  value: number; kind: "administrative_scale" | "statistical_average"; referencePeriod: string;
};
export type StatisticSource = {
  id: string; title: string; organization: string; url: string; issuedAt: string | null; notes: string;
};
export type ProvinceStatistic = {
  displayName: string; area: AreaMetric; population: PopulationMetric;
  plateCodes: string[]; plateSourceId: string; plateEffectiveFrom: string;
};
export type ComparisonRow = { code: string; name: string; area: AreaMetric | null; population: PopulationMetric | null; plateCodes: string[] };
export type VerifiedStatsResponse = {
  period: AdminPeriod; province: { code: string; name: string; kind: string };
  level: "province" | "commune";
  commune?: { code: string; name: string; kind: string };
  area: AreaMetric | null; population: PopulationMetric | null;
  density: number | null;
  plateCodes: string[]; plateSourceId: string | null;
  plateNote: string; comparison: ComparisonRow[]; sources: StatisticSource[];
  dataVersion: string;
};

const raw = statisticsJson as unknown as {
  datasetVersion: string;
  data: Record<AdminPeriod, Record<string, ProvinceStatistic>>;
};
const sources = sourcesJson as Record<string, StatisticSource>;

/** Strip prefixes, preserve word boundaries and handle "TP." consistently. */
export function normalizePlaceName(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/^(?:tinh |thanh pho |tp\.?\s*)/, "")
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function locate(period: AdminPeriod, row: ProvinceRow): ProvinceStatistic | null {
  return raw.data[period][normalizePlaceName(row.name)] ?? null;
}

export function getVerifiedProvinceStats(period: AdminPeriod, provinceCode: string, wardCode?: string | null): VerifiedStatsResponse | null {
  const province = getProvinceRows(period).find((p) => p.code === provinceCode);
  if (!province) return null;
  const ward = wardCode ? getUnitByCode(period, wardCode) : null;
  if (wardCode && (!ward || ward.provinceCode !== province.code)) return null;
  const stored = locate(period, province);
  const level = wardCode ? "commune" : "province";
  const compare = period === "current" && !wardCode
    ? province.formerProvinces?.map((former): ComparisonRow => {
      const base = getProvinceRows("before").find((p) => p.code === former.code);
      const record = base && locate("before", base);
      return { code: former.code, name: former.name, area: record?.area ?? null,
        population: record?.population ?? null, plateCodes: record?.plateCodes ?? [] };
    }) ?? [] : [];
  const needed = [stored?.area.sourceId, stored?.population.sourceId, stored?.plateSourceId,
    ...compare.flatMap((p) => p.area?.sourceId ? [p.area.sourceId, p.population?.sourceId] : [])]
    .filter((x): x is string => typeof x === "string");
  const srcs = [...new Set(needed)].map((id) => sources[id]).filter((x): x is StatisticSource => Boolean(x));
  const density = !wardCode && stored?.area.valueKm2 && stored?.population.value
    ? Math.round(stored.population.value / stored.area.valueKm2) : null;
  return {
    period, province: { code: province.code, name: province.name, kind: province.kind }, level,
    commune: ward ? { code: ward.code, name: ward.name, kind: ward.kind } : undefined,
    area: wardCode ? null : stored?.area ?? null,
    population: wardCode ? null : stored?.population ?? null,
    density,
    plateCodes: stored?.plateCodes ?? [],
    plateSourceId: stored?.plateSourceId ?? null,
    plateNote: wardCode
      ? "Đây là ký hiệu biển số của tỉnh/thành quản lý; cấp xã không có ký hiệu riêng trong phụ lục này."
      : "Ký hiệu theo phụ lục biển số có hiệu lực ở thời kỳ đang xem. Không xác định địa chỉ chủ xe từ mã biển số.",
    comparison: compare, sources: srcs,
    dataVersion: raw.datasetVersion,
  };
}

export function findProvincesByPlate(period: AdminPeriod, input: string): {
  special: string | null; matches: Array<{ code: string; name: string; plateCodes: string[] }>;
} {
  const code = input.trim();
  if (!/^\d{2}$/.test(code)) return { special: null, matches: [] };
  if (code === "80") return { special: "80 là ký hiệu do Cục Cảnh sát giao thông quản lý, không phải biển số của một tỉnh/thành.", matches: [] };
  return { special: null, matches: getProvinceRows(period).flatMap((province) => {
    const data = locate(period, province);
    if (!data?.plateCodes.includes(code)) return [];
    return [{ code: province.code, name: province.name, plateCodes: data.plateCodes }];
  }) };
}

export function getVerifiedCoverage() {
  return { before: Object.keys(raw.data.before).length, current: Object.keys(raw.data.current).length,
    currentAdministrativePopulation: Object.values(raw.data.current).filter((p) => p.population.kind === "administrative_scale").length,
    currentStatisticalPopulation: Object.values(raw.data.current).filter((p) => p.population.kind === "statistical_average").length,
    legacyCommuneGeometryVerified: 0, communeStatisticsVerified: 0 };
}
