import { NextRequest, NextResponse } from "next/server";
import { getCatalogStats, getDistrictRows, getProvinceRows, getUnitRows, getWardRelation, type AdminPeriod } from "@/lib/admin-data";
import { ADMIN_SOURCES, DATA_CONTEXT } from "@/lib/admin-sources";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLocaleLowerCase("vi-VN");
const json = (value: unknown) => NextResponse.json(value, { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600", "X-Content-Type-Options": "nosniff" } });

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const period: AdminPeriod = params.get("period") === "before" ? "before" : "current";
  const mode = params.get("mode") ?? "units";
  if (mode === "sources") return json({ metadata: DATA_CONTEXT, sources: ADMIN_SOURCES });
  if (mode === "provinces") return json({ period, rows: getProvinceRows(period), stats: getCatalogStats(period) });
  if (mode === "relation") {
    const code = (params.get("code") ?? "").trim();
    if (!/^\d{5}$/.test(code)) return NextResponse.json({ error: "Mã xã/phường không hợp lệ" }, { status: 400 });
    return json({ period, code, ...getWardRelation(code, period) });
  }
  if (mode !== "units") return NextResponse.json({ error: "Chế độ truy vấn không hợp lệ" }, { status: 400 });

  const province = (params.get("province") ?? "").trim();
  const district = (params.get("district") ?? "").trim();
  const query = (params.get("q") ?? "").slice(0, 120).trim();
  const page = Math.max(1, Math.min(1000, Number.parseInt(params.get("page") ?? "1", 10) || 1));
  const pageSize = Math.max(1, Math.min(80, Number.parseInt(params.get("size") ?? "40", 10) || 40));
  if (province && !/^\d{2}$/.test(province)) return NextResponse.json({ error: "Mã tỉnh/thành không hợp lệ" }, { status: 400 });
  if (district && !/^\d{3}$/.test(district)) return NextResponse.json({ error: "Mã quận/huyện không hợp lệ" }, { status: 400 });
  const provinceExists = !province || getProvinceRows(period).some((row) => row.code === province);
  if (!provinceExists) return NextResponse.json({ error: "Không tìm thấy tỉnh/thành" }, { status: 404 });
  const data = getUnitRows(period, province);
  const search = normalize(query);
  const rows = data.filter((unit) => (!district || unit.districtCode === district) && (!search || normalize(unit.name).includes(search) || unit.code.includes(search) || normalize(unit.districtName ?? "").includes(search)));
  return json({
    period, province, query, page, pageSize, total: rows.length,
    rows: rows.slice((page - 1) * pageSize, page * pageSize),
    districts: period === "before" && province ? getDistrictRows(province) : [],
    dataset: DATA_CONTEXT.communityDataset,
    effectiveDate: period === "before" ? DATA_CONTEXT.legacySnapshot : DATA_CONTEXT.currentSnapshot,
  });
}
