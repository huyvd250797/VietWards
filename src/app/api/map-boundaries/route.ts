import { NextRequest, NextResponse } from "next/server";
import { getProvinceRows, type AdminPeriod } from "@/lib/admin-data";

/**
 * VietWards V0.3.0 — server-side GIS gateway.
 * The third-party data is a cartographic reference, NOT certified legal boundaries.
 * Fetching on the server avoids browser CORS and keeps upstream URLs auditable.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const DATA_SOURCES = {
  current: [
    "https://raw.githubusercontent.com/truongdinh018/GeoVN/main/data/provinces.geojson",
    "https://truongdinh018.github.io/GeoVN/data/provinces.geojson",
  ],
  before: [
    "https://maps.pispace.eu/data-download/?file=vietnam-regions.geojson&set=vietnam",
    "https://raw.githubusercontent.com/thongnv99/vietnam-interactive-map/main/public/vn.json",
  ],
} as const;

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d").toLowerCase()
    .replace(/\b(ho chi minh city|tp ho chi minh)\b/g, "ho chi minh")
    .replace(/^(tinh|thanh pho|tp|province|city)\s+/g, "")
    .replace(/\b(province|city|municipality)\b/g, "")
    .replace(/[^a-z0-9]/g, "").trim();
}

type GeoFeature = {
  type: "Feature";
  id?: string | number;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
};

type GeoCollection = { type: "FeatureCollection"; features: GeoFeature[] };

const ENGLISH_ALIASES: Record<string, string> = {
  hochiminh: "hochiminh", saigon: "hochiminh",
  thuathienhue: "hue", thuathienhueprovince: "hue", hue: "hue",
  daklak: "daklak", daknong: "daknong", danang: "danang",
  bariaungtau: "bariavungtau", bariavungtau: "bariavungtau",
  cantho: "cantho", haiphong: "haiphong",
};

function canonicalName(value: string) {
  const key = normalize(value);
  return ENGLISH_ALIASES[key] ?? key;
}

function candidateNames(p: Record<string, unknown>): string[] {
  const fields = ["name_local", "name", "NAME", "name_vi", "fullName", "name_en", "nameEn", "VARNAME_1", "NAME_1"];
  return fields.map((key) => p[key]).filter((value): value is string => typeof value === "string" && !!value.trim());
}

function isGeoCollection(value: unknown): value is GeoCollection {
  if (!value || typeof value !== "object") return false;
  const data = value as GeoCollection;
  return data.type === "FeatureCollection" && Array.isArray(data.features) && data.features.length > 0 &&
    data.features.every((feature) => feature?.type === "Feature" &&
      (feature.geometry?.type === "Polygon" || feature.geometry?.type === "MultiPolygon") &&
      Array.isArray(feature.geometry?.coordinates));
}

async function fetchBoundarySnapshot(period: AdminPeriod) {
  const errors: string[] = [];
  for (const source of DATA_SOURCES[period]) {
    try {
      const response = await fetch(source, {
        next: { revalidate: 86400 },
        headers: { Accept: "application/geo+json, application/json, */*" },
        signal: AbortSignal.timeout(14000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.text();
      if (body.length > 10_000_000) throw new Error("Dataset vượt 10 MB");
      const data: unknown = JSON.parse(body);
      if (!isGeoCollection(data)) throw new Error("GeoJSON không hợp lệ");
      const expected = period === "current" ? 34 : 63;
      if (data.features.length !== expected) throw new Error(`Nguồn có ${data.features.length}/${expected} vùng`);
      return { source, data };
    } catch (error) {
      errors.push(`${new URL(source).hostname}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  throw new Error(errors.join("; "));
}

/** Returns a GeoJSON feature collection + provenance; never substitutes invented polygons. */
export async function GET(request: NextRequest) {
  const period: AdminPeriod = request.nextUrl.searchParams.get("period") === "before" ? "before" : "current";
  try {
    const { source, data } = await fetchBoundarySnapshot(period);
    const master = getProvinceRows(period);
    const byCode = new Map(master.map((row) => [row.code, row]));
    const byName = new Map(master.map((row) => [canonicalName(row.name), row]));
    // Legacy short-vs-full Hue forms are equivalent in this map only.
    const hue = master.find((row) => ["hue", "thuathienhue"].includes(normalize(row.name)));
    if (hue) { byName.set("hue", hue); byName.set("thuathienhue", hue); }
    const matched = new Set<string>();
    const unmatchedNames: string[] = [];
    const features = data.features.map((feature, index) => {
      const props = feature.properties ?? {};
      const sourceCode = String(props.code ?? "");
      let row = period === "current" ? byCode.get(sourceCode) : undefined;
      const names = candidateNames(props);
      if (!row) {
        for (const name of names) {
          const candidate = byName.get(canonicalName(name));
          if (candidate && !matched.has(candidate.code)) { row = candidate; break; }
        }
      }
      const code = row?.code ?? `unmatched-${period}-${index + 1}`;
      if (row) matched.add(row.code);
      else unmatchedNames.push(names[0] ?? code);
      return {
        type: "Feature" as const,
        id: code,
        geometry: feature.geometry,
        properties: {
          code, name: row?.name ?? names[0] ?? "Chưa định danh",
          kind: row?.kind ?? "Chưa đối chiếu", matched: Boolean(row), tone: index % 5,
          sourceCode: sourceCode || null,
          labelLng: typeof props.labelLng === "number" ? props.labelLng : null,
          labelLat: typeof props.labelLat === "number" ? props.labelLat : null,
        },
      };
    });
    return NextResponse.json({
      type: "FeatureCollection", features,
      metadata: {
        period, expected: period === "current" ? 34 : 63, geometryCount: features.length,
        matchedCount: matched.size, unmatchedNames, source,
        accuracy: "Dữ liệu ranh giới tham khảo phục vụ giáo dục, không phải bản đồ pháp lý chính thức.",
        releaseDate: "2026-11-23",
      },
    }, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("[vietwards:gis]", error);
    return NextResponse.json({ error: "Không tải được ranh giới GIS từ nguồn tham khảo. Vui lòng thử lại.", details: error instanceof Error ? error.message : "Unknown error" }, { status: 503 });
  }
}
