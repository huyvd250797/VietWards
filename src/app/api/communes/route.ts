import { NextRequest, NextResponse } from "next/server";
import { getProvinceRows, getUnitRows } from "@/lib/admin-data";
import { isValidProvinceCode } from "@/lib/commune-search";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const provinceCode = request.nextUrl.searchParams.get("province") ?? "";
  if (!isValidProvinceCode(provinceCode) || !getProvinceRows("current").some((row) => row.code === provinceCode)) {
    return NextResponse.json({ error: "Mã tỉnh/thành không hợp lệ." }, { status: 400 });
  }
  const rows = getUnitRows("current", provinceCode);
  return NextResponse.json({ provinceCode, expected: rows.length, rows, period: "current" }, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800", "X-Content-Type-Options": "nosniff" },
  });
}
