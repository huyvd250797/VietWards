import { NextResponse } from "next/server";
import legacyManifest from "../../../../public/data/legacy/manifest.json";
import statistics from "@/data/verified-province-statistics.json";
import { getProvinceRows } from "@/lib/admin-data";
import { APP } from "@/lib/config";
import { DATA_CONTEXT } from "@/lib/admin-sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LegacyManifest = { provinces?: Record<string, { verified?: boolean; sourceUrl?: string; license?: string }> };

/** Local data/package diagnostics; does not equate a healthy API with verified legal GIS. */
export async function GET() {
  const current = getProvinceRows("current").length;
  const before = getProvinceRows("before").length;
  const recordsCurrent = Object.keys(statistics.data.current).length;
  const recordsBefore = Object.keys(statistics.data.before).length;
  // Static build import ensures the checked manifest exists in Vercel serverless bundles.
  const manifestReadable = Boolean(legacyManifest);
  const manifest = legacyManifest as unknown as LegacyManifest;
  const legacyVerified = Object.values(manifest.provinces ?? {}).filter(x => x.verified && x.sourceUrl && x.license).length;
  const catalogOK = current === 34 && before === 63;
  const statsOK = recordsCurrent === 34 && recordsBefore === 63;
  const operational = catalogOK && statsOK && manifestReadable;
  const payload = {
    app: APP.name, version: APP.version, checkedAt: new Date().toISOString(),
    state: operational ? "operational_with_data_limits" : "degraded",
    checks: {
      provinceCatalog: { ok: catalogOK, current, before },
      provincialStatistics: { ok: statsOK, current: recordsCurrent, before: recordsBefore },
      historicalGISManifest: { ok: manifestReadable, verifiedProvinces: legacyVerified, expectedProvinces: 63 },
      externalGISRuntime: { checked: false, status: "not_probed", note: "Nguồn GIS bên ngoài chỉ được kiểm tra khi người dùng yêu cầu." },
    },
    data: { legacySnapshot: DATA_CONTEXT.legacySnapshot, currentSnapshot: DATA_CONTEXT.currentSnapshot },
    limitations: [
      "GIS cấp tỉnh và cấp xã hiện tại sử dụng dữ liệu tham khảo, chưa xác nhận pháp lý.",
      legacyVerified < 63 ? `GIS xã/phường cũ có nguồn xác minh được khai báo: ${legacyVerified}/63 tỉnh.` : "Các polygon lịch sử khai báo cần kiểm tra lại từng địa phương.",
      "Thống kê dân số có nhiều kỳ và phương pháp; không phải dữ liệu dân số thời gian thực.",
    ],
  };
  return NextResponse.json(payload, {
    status: operational ? 200 : 503,
    headers: { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" },
  });
}
