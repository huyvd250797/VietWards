import { NextRequest, NextResponse } from "next/server";
import { getProvinceRows, getUnitRows } from "@/lib/admin-data";
import { canonicalCommuneCode, isValidProvinceCode } from "@/lib/commune-search";

/** Only serves 2025+ current commune GIS. Historical commune boundaries are V0.7.0. */
export const runtime = "nodejs";
export const maxDuration = 30;

const UPSTREAMS = (code: string) => [
  `https://raw.githubusercontent.com/truongdinh018/GeoVN/main/data/wards/${code}.geojson`,
  `https://truongdinh018.github.io/GeoVN/data/wards/${code}.geojson`,
];
const MAX_BYTES = 9_000_000;
type Geometry = { type: "Polygon" | "MultiPolygon"; coordinates: unknown };
type RawFeature = { type: string; id?: unknown; properties?: Record<string, unknown>; geometry?: Geometry };
type RawDataset = { type: "FeatureCollection"; features: RawFeature[] };

function polygonFeature(raw: RawFeature): raw is RawFeature & { geometry: Geometry } {
  return raw?.type === "Feature" &&
    (raw.geometry?.type === "Polygon" || raw.geometry?.type === "MultiPolygon") &&
    Array.isArray(raw.geometry.coordinates);
}

async function getRemoteDataset(code: string): Promise<{ dataset: RawDataset; url: string }> {
  const problems: string[] = [];
  for (const url of UPSTREAMS(code)) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 86400 }, headers: { Accept: "application/geo+json, application/json, */*" },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const length = Number(response.headers.get("content-length"));
      if (Number.isFinite(length) && length > MAX_BYTES) throw new Error("Vượt giới hạn dung lượng GIS");
      const body = await response.text();
      if (body.length > MAX_BYTES) throw new Error("Vượt giới hạn dung lượng GIS");
      const dataset: RawDataset = JSON.parse(body);
      if (dataset?.type !== "FeatureCollection" || !Array.isArray(dataset.features) || !dataset.features.length ||
        !dataset.features.every(polygonFeature)) throw new Error("GeoJSON cấp xã không hợp lệ");
      return { dataset, url };
    } catch (error) { problems.push(`${new URL(url).hostname}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  throw new Error(problems.join("; "));
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("province") ?? "";
  const province = isValidProvinceCode(code) && getProvinceRows("current").find((row) => row.code === code);
  if (!province) return NextResponse.json({ error: "Mã tỉnh/thành không hợp lệ." }, { status: 400 });
  const wards = getUnitRows("current", code);
  const byCode = new Map(wards.map((ward) => [ward.code, ward]));
  try {
    const { dataset, url } = await getRemoteDataset(code);
    const matched = new Set<string>();
    const unmatchedGeometryNames: string[] = [];
    let duplicateCodes = 0;
    let wrongProvinceCount = 0;
    const features = dataset.features.map((feature, index) => {
      const raw = feature.properties ?? {};
      const geoCode = canonicalCommuneCode(raw.code ?? feature.id);
      const geoProvince = String(raw.provinceCode ?? "");
      const ward = geoCode ? byCode.get(geoCode) : undefined;
      const valid = !!ward && geoProvince === code && !matched.has(ward.code);
      if (geoCode && matched.has(geoCode)) duplicateCodes++;
      if (geoProvince && geoProvince !== code) wrongProvinceCount++;
      if (valid && ward) matched.add(ward.code);
      else unmatchedGeometryNames.push(String(raw.name ?? geoCode ?? index + 1));
      const id = valid && ward ? ward.code : `unmatched-${index}`;
      return {
        type: "Feature" as const, id,
        geometry: feature.geometry,
        properties: {
          code: id, name: valid && ward ? ward.name : String(raw.fullName ?? raw.name ?? "Chưa đối chiếu"),
          kind: valid && ward ? ward.kind : "Chưa đối chiếu", matched: valid,
          provinceCode: code, tone: index % 5, sourceCode: geoCode,
        },
      };
    });
    const missingCodes = wards.filter((ward) => !matched.has(ward.code)).map((ward) => ward.code);
    // Fail closed if the source changed unexpectedly, rather than showing a fake or empty map.
    if (!matched.size) throw new Error("Không có polygon nào đối chiếu được mã hành chính.");
    return NextResponse.json({
      type: "FeatureCollection", features,
      metadata: {
        period: "current", provinceCode: code, provinceName: province.name,
        expected: wards.length, geometryCount: dataset.features.length, matchedCount: matched.size,
        missingCodes, unmatchedGeometryNames, duplicateCodes, wrongProvinceCount,
        source: url, sourceDate: "2026-03-13", catalogSource: "decision-19-2025",
        accuracy: "GIS tham khảo giáo dục, chưa xác nhận là địa giới pháp lý; mã hành chính được đối chiếu, không thay thế khảo sát địa giới.",
      },
    }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.warn("[vietwards:commune-gis]", code, error);
    return NextResponse.json({
      error: "Không tải được GIS cấp xã từ nguồn tham khảo. Danh mục hành chính vẫn hoạt động.",
      details: error instanceof Error ? error.message : "Unknown GIS error",
    }, { status: 503 });
  }
}
