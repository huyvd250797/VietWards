/** Stable, client-safe province search. Province codes always remain two-character strings. */
export type SearchableProvince = { code: string; name: string; kind: string };
export type ProvinceTypeFilter = "all" | "province" | "city";

const ALIASES: Record<string, string[]> = {
  "01": ["ha noi", "hanoi", "hn"],
  "79": ["tphcm", "tp hcm", "hcm", "sai gon", "saigon", "ho chi minh city", "hochiminh"],
  "31": ["hai phong", "haiphong"],
  "48": ["da nang", "danang"],
  "92": ["can tho", "cantho"],
  "75": ["dong nai"],
};

export function normalizeProvinceSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
    .toLocaleLowerCase("vi-VN").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function isProvinceCity(item: SearchableProvince): boolean {
  return normalizeProvinceSearch(item.kind).includes("thanh pho") || normalizeProvinceSearch(item.name).startsWith("thanh pho ");
}

export function searchProvinces<T extends SearchableProvince>(rows: T[], query: string, filter: ProvinceTypeFilter = "all"): T[] {
  const needle = normalizeProvinceSearch(query).slice(0, 120);
  const needleCompacted = needle.replace(/ /g, "");
  const rank = (item: T) => {
    if (!needle) return 0;
    const name = normalizeProvinceSearch(item.name);
    const compact = name.replace(/ /g, "");
    const short = name.replace(/^(thanh pho|tinh) /, "");
    const aliases = (ALIASES[item.code] ?? []).map(normalizeProvinceSearch);
    if (item.code === needle || name === needle || short === needle || aliases.includes(needle)) return 0;
    if (name.startsWith(needle) || short.startsWith(needle) || compact.startsWith(needleCompacted)) return 1;
    if (name.includes(needle) || compact.includes(needleCompacted) || item.code.includes(needle) || aliases.some((a) => a.includes(needle))) return 2;
    return -1;
  };
  return rows.filter((row) => filter === "all" || (filter === "city" ? isProvinceCity(row) : !isProvinceCity(row)))
    .map((row) => ({ row, score: rank(row) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score || a.row.name.localeCompare(b.row.name, "vi"))
    .map(({ row }) => row);
}

/** Canonical, sharable URL; no private user data in query params. */
export function provinceHref(path: "/ban-do" | "/tinh-thanh", period: "before" | "current", code?: string | null): string {
  const params = new URLSearchParams({ period });
  if (code && /^\d{2}$/.test(code)) params.set("province", code);
  return `${path}?${params.toString()}`;
}
