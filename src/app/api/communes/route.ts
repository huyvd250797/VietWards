import { NextRequest, NextResponse } from "next/server";
import { getProvinceRows, getUnitRows, getDistrictRows } from "@/lib/admin-data";
import { isValidProvinceCode } from "@/lib/commune-search";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const provinceCode = request.nextUrl.searchParams.get("province") ?? "";
  const period = request.nextUrl.searchParams.get("period") === "before" ? "before" : "current";
  const district = request.nextUrl.searchParams.get("district");
  if (!isValidProvinceCode(provinceCode) || !getProvinceRows(period).some((row) => row.code === provinceCode)) {
    return NextResponse.json({ error: "Mã tỉnh/thành không hợp lệ." }, { status: 400 });
  }
  const districts = period === "before" ? getDistrictRows(provinceCode) : [];
  if (district && (period !== "before" || !districts.some((row) => row.code === district))) {
    return NextResponse.json({ error: "Mã huyện lịch sử không thuộc tỉnh được chọn." }, { status: 400 });
  }
  const rows = getUnitRows(period, provinceCode).filter((row) => !district || row.districtCode === district);
  return NextResponse.json({ provinceCode, expected: rows.length, rows, period, district: district ?? null, districts }, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800", "X-Content-Type-Options": "nosniff" },
  });
}
