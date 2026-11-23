/** Verifies opt-in, per-province historical GeoJSON. Never fabricates geometry
 * by clipping present-day boundaries or assigning shapes from names alone. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getUnitRows } from "./admin-data";

export type LegacyGeometryEntry = {
  file: string; sourceUrl: string; license: string; snapshot: "2025-06-30";
  verified: true; verifiedOn: string;
};
type Manifest = { schemaVersion: number; snapshot: string; provinces: Record<string, LegacyGeometryEntry> };
type RawFeature = { type: "Feature"; id?: unknown;
  properties?: Record<string, unknown>;
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: unknown } };

export class HistoricalGISUnavailable extends Error {
  constructor(message: string) { super(message); this.name = "HistoricalGISUnavailable"; }
}

export async function loadVerifiedHistoricalGIS(provinceCode: string) {
  const manifest = JSON.parse(await readFile(join(process.cwd(), "public/data/legacy/manifest.json"), "utf8")) as Manifest;
  const entry = manifest.provinces[provinceCode];
  if (!entry || entry.verified !== true || entry.snapshot !== "2025-06-30" || !entry.sourceUrl ||
    !entry.license || !/^\d{4}-\d{2}-\d{2}$/.test(entry.verifiedOn)) {
    throw new HistoricalGISUnavailable("Chưa có bộ ranh giới xã/phường cũ đã kiểm chứng cho tỉnh này. Vẫn có thể tra cứu đầy đủ danh mục và quan hệ sáp nhập.");
  }
  if (entry.file !== `${provinceCode}.geojson`) throw new Error("Tên file GIS trong manifest không hợp lệ.");
  const content = await readFile(join(process.cwd(), "public/data/legacy/wards", entry.file), "utf8");
  if (content.length > 18_000_000) throw new Error("File GIS lịch sử vượt giới hạn kích thước.");
  const raw = JSON.parse(content) as { type: "FeatureCollection"; features: RawFeature[] };
  if (raw.type !== "FeatureCollection" || !Array.isArray(raw.features) || !raw.features.length) throw new Error("GeoJSON lịch sử không hợp lệ.");
  const master = getUnitRows("before", provinceCode);
  const byCode = new Map(master.map((row) => [row.code, row]));
  const matched = new Set<string>();
  let duplicates = 0;
  const missingGeometryNames: string[] = [];
  const features = raw.features.map((feature, i) => {
    if (feature.type !== "Feature" || !["Polygon", "MultiPolygon"].includes(feature.geometry?.type) || !Array.isArray(feature.geometry?.coordinates)) throw new Error(`Polygon lịch sử không hợp lệ ở dòng ${i+1}`);
    // Full 5-digit official code is required. Names are not enough to match.
    const code = String(feature.properties?.code ?? feature.id ?? "");
    const row = /^\d{5}$/.test(code) ? byCode.get(code) : undefined;
    const valid = !!row && !matched.has(code) && (feature.properties?.provinceCode === undefined || feature.properties?.provinceCode === provinceCode);
    if (row && matched.has(code)) duplicates++;
    if (valid) matched.add(code);
    else missingGeometryNames.push(String(feature.properties?.name ?? code ?? i));
    return { type: "Feature" as const, id: valid ? code : `unmatched-${i}`, geometry: feature.geometry,
      properties: { code: valid ? code : `unmatched-${i}`, name: valid ? row!.name : "Chưa đối chiếu", kind: valid ? row!.kind : "Chưa đối chiếu", matched: valid, provinceCode,
        districtCode: valid ? row!.districtCode : null, tone: i % 5 } };
  });
  if (!matched.size) throw new Error("Không ghép được mã xã lịch sử nào: từ chối dữ liệu ranh giới.");
  return { type: "FeatureCollection" as const, features,
    metadata: { period: "before", expected: master.length, geometryCount: features.length, matchedCount: matched.size,
      missingCodes: master.filter((row) => !matched.has(row.code)).map((row) => row.code),
      unmatchedGeometryNames: missingGeometryNames, duplicateCodes: duplicates, wrongProvinceCount: 0,
      source: entry.sourceUrl, sourceDate: entry.snapshot, license: entry.license,
      accuracy: `GIS lịch sử đã đối chiếu mã, không thay thế ranh giới pháp lý. Kiểm tra ngày ${entry.verifiedOn}.` } };
}
