import { NextRequest, NextResponse } from "next/server";
import { findProvincesByPlate, getVerifiedProvinceStats } from "@/lib/verified-statistics";
import type { AdminPeriod } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const period = searchParams.get("period");
  if (period !== "before" && period !== "current") {
    return NextResponse.json({ error: "Kỳ hành chính phải là before hoặc current." }, { status: 400 });
  }
  if (searchParams.get("mode") === "plate") {
    const code = searchParams.get("code") ?? "";
    if (!/^\d{2}$/.test(code)) return NextResponse.json({ error: "Mã biển số phải gồm đúng 2 chữ số." }, { status: 400 });
    return NextResponse.json({ period, code, ...findProvincesByPlate(period, code) });
  }
  const province = searchParams.get("province") ?? "";
  if (!/^\d{2}$/.test(province)) return NextResponse.json({ error: "Mã tỉnh không hợp lệ." }, { status: 400 });
  const ward = searchParams.get("ward");
  if (ward && !/^\d{5}$/.test(ward)) return NextResponse.json({ error: "Mã cấp xã phải gồm 5 chữ số." }, { status: 400 });
  const result = getVerifiedProvinceStats(period as AdminPeriod, province, ward);
  if (!result) return NextResponse.json({ error: "Không tìm thấy đơn vị hành chính trong kỳ hoặc mã cấp xã không thuộc tỉnh." }, { status: 404 });
  return NextResponse.json(result, { headers: { "Cache-Control": "public, max-age=300, s-maxage=86400" } });
}
