/** Browser-safe, deterministic province succession. All relationships are supplied by
 * the canonical server catalogue; never infer province merges from GIS geometry. */
export type HistoricalPeriod = "before" | "current";
export type HistoricalLink = { code: string; formerProvinces?: { code: string; name: string }[] };
export type HistoricalSelection = {
  period: HistoricalPeriod;
  selectedProvinceCode: string | null;
  selectedProvinceCodes: string[];
  originProvinceCode: string | null;
  mode: "single" | "group";
};
const valid = (code: unknown): code is string => typeof code === "string" && /^\d{2}$/.test(code);
export const emptyHistoricalSelection = (period: HistoricalPeriod = "current"): HistoricalSelection => ({
  period, selectedProvinceCode: null, selectedProvinceCodes: [], originProvinceCode: null, mode: "single",
});

export function singleSelection(period: HistoricalPeriod, code: string | null): HistoricalSelection {
  return valid(code) ? { period, selectedProvinceCode: code, selectedProvinceCodes: [code], originProvinceCode: null, mode: "single" }
    : emptyHistoricalSelection(period);
}

export function switchHistoricalPeriod(
  state: HistoricalSelection, nextPeriod: HistoricalPeriod, links: HistoricalLink[],
): HistoricalSelection {
  if (state.period === nextPeriod) return state;
  const code = state.selectedProvinceCode;
  if (!code) return emptyHistoricalSelection(nextPeriod);
  if (nextPeriod === "before") {
    const owner = links.find((row) => row.code === code);
    const sources = [...new Set((owner?.formerProvinces ?? []).map((source) => source.code).filter(valid))];
    if (!owner || sources.length === 0) return emptyHistoricalSelection(nextPeriod);
    return {
      period: "before", selectedProvinceCode: sources[0], selectedProvinceCodes: sources,
      originProvinceCode: code, mode: sources.length > 1 ? "group" : "single",
    };
  }
  const owner = links.find((row) => row.formerProvinces?.some((source) => source.code === code));
  return owner ? { ...singleSelection("current", owner.code), originProvinceCode: code }
    : emptyHistoricalSelection("current");
}

export function validateHistoricalSelection(state: HistoricalSelection, links: HistoricalLink[]): HistoricalSelection {
  const current = new Set(links.map((link) => link.code));
  const former = new Set(links.flatMap((link) => link.formerProvinces?.map((p) => p.code) ?? []));
  const allowed = state.period === "current" ? current : former;
  const anchor = state.selectedProvinceCode;
  if (!anchor || !allowed.has(anchor)) return emptyHistoricalSelection(state.period);
  if (state.period === "current") return { ...singleSelection("current", anchor), originProvinceCode: state.originProvinceCode && former.has(state.originProvinceCode) ? state.originProvinceCode : null };
  const owner = links.find((row) => row.formerProvinces?.some((p) => p.code === anchor));
  const possible = new Set(owner?.formerProvinces?.map((p) => p.code) ?? []);
  const codes = [...new Set(state.selectedProvinceCodes)].filter((x) => possible.has(x));
  if (codes.length <= 1 || !codes.includes(anchor) || codes.length !== possible.size) return singleSelection("before", anchor);
  return { period: "before", selectedProvinceCode: anchor, selectedProvinceCodes: codes,
    originProvinceCode: owner?.code ?? null, mode: "group" };
}

/** URL-only serialisation: group must be explicitly scoped to one verified successor. */
export function historicHref(path: "/ban-do" | "/tinh-thanh" | "/lich-su", state: HistoricalSelection): string {
  const params = new URLSearchParams({ period: state.period });
  if (state.selectedProvinceCode) params.set("province", state.selectedProvinceCode);
  if (state.mode === "group" && state.selectedProvinceCodes.length > 1) params.set("group", state.selectedProvinceCodes.join(","));
  if (state.originProvinceCode) params.set("origin", state.originProvinceCode);
  return `${path}?${params.toString()}`;
}

export function selectionFromParams(params: URLSearchParams, fallbackPeriod: HistoricalPeriod): HistoricalSelection {
  const period = params.get("period") === "before" || params.get("period") === "current"
    ? (params.get("period") as HistoricalPeriod) : fallbackPeriod;
  const anchor = params.get("province");
  if (!valid(anchor)) return emptyHistoricalSelection(period);
  const group = params.get("group")?.split(",").filter(valid) ?? [];
  const codes = group.length > 1 && group.length <= 4 && group.includes(anchor)
    ? [...new Set(group)] : [anchor];
  return { period, selectedProvinceCode: anchor, selectedProvinceCodes: codes,
    originProvinceCode: valid(params.get("origin")) ? params.get("origin") : null,
    mode: codes.length > 1 ? "group" : "single" };
}
