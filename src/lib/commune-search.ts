/** Search and GIS mapping are code-first: a renamed 2026 ward keeps its 5-digit code. */
export type CommuneKindFilter = "all" | "Xã" | "Phường" | "Đặc khu" | "Thị trấn";
export type CommuneCandidate = { code: string; name: string; kind: string; provinceCode: string };

export function normalizeCommuneQuery(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d").toLocaleLowerCase("vi-VN")
    .replace(/[^a-z0-9]/g, "").replace(/\s+/g, " ").trim();
}
export function filterCommunes<T extends CommuneCandidate>(rows: T[], query: string, kind: CommuneKindFilter = "all"): T[] {
  const needle = normalizeCommuneQuery(query);
  return rows.filter((row) => (kind === "all" || row.kind === kind) &&
    (!needle || normalizeCommuneQuery(`${row.name} ${row.code}`).includes(needle)));
}
export function canonicalCommuneCode(raw: unknown): string | null {
  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw <= 99999) return String(raw).padStart(5, "0");
  if (typeof raw !== "string" || !/^\d{1,5}$/.test(raw)) return null;
  return raw.padStart(5, "0");
}
export function isValidProvinceCode(code: string): boolean { return /^\d{2}$/.test(code); }
export function isValidCommuneCode(code: string): boolean { return /^\d{5}$/.test(code); }
