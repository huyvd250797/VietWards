import { NextRequest, NextResponse } from "next/server";
import { getUnitByCode, getWardRelation, type AdminPeriod } from "@/lib/admin-data";
import { isValidCommuneCode } from "@/lib/commune-search";

/** A historical edge is NOT a polygon: these relations support split/merge
 * exploration even where legally reusable pre-2025 geometry is unavailable. */
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const period: AdminPeriod = request.nextUrl.searchParams.get("period") === "before" ? "before" : "current";
  const code = request.nextUrl.searchParams.get("code") ?? "";
  if (!isValidCommuneCode(code)) return NextResponse.json({ error: "Mã cấp xã phải gồm 5 chữ số." }, { status: 400 });
  const source = getUnitByCode(period, code);
  if (!source) return NextResponse.json({ error: "Không tìm thấy đơn vị ở thời kỳ yêu cầu." }, { status: 404 });
  const relation = getWardRelation(code, period);
  const nextPeriod: AdminPeriod = period === "current" ? "before" : "current";
  const targets = relation.targets.flatMap((target) => {
    // The underlying community mapping may reference a former district when
    // the original commune has no exact match. Do not invent a five-digit code.
    const row = isValidCommuneCode(target.code) ? getUnitByCode(nextPeriod, target.code) : null;
    return row ? [{ code: row.code, name: row.name, kind: row.kind, provinceCode: row.provinceCode,
      districtCode: row.districtCode ?? null, districtName: row.districtName ?? null,
      partial: "partial" in target ? Boolean(target.partial) : relation.status === "partial" }] : [];
  });
  const distinct = [...new Map(targets.map((entry) => [entry.code, entry])).values()];
  return NextResponse.json({ period, code, source, targetPeriod: nextPeriod, status: relation.status,
    targets: distinct, unresolvedReferences: relation.targets.length - targets.length,
    sourceId: relation.sourceId,
    note: "Quan hệ là dữ liệu đối chiếu hành chính; không chứng minh ranh giới hình học chính xác." },
  { headers: { "Cache-Control": "public, max-age=0, s-maxage=86400", "X-Content-Type-Options": "nosniff" } });
}
