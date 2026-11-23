# VietWards V0.8.0 — Verified Statistics & Plates

Release date: 23 November 2026. Baseline: user-supplied V0.7.0 ZIP.

## Shipped

1. **97 official-source provincial statistical records:** 63 in the legacy period and 34 in the current period. Area and population values include explicit type, reference date, official document ID and display-level verification status.
2. **23 new post-merger provinces/cities** use the land area and administrative population scale quoted in National Assembly Resolution 202/2025/QH15 (reference June 2025). **11 non-merged units** use NSO yearbook 2024; they explicitly remain older statistical estimates, not “2026 population”. The entire **63-province legacy view** uses NSO 2024 data, with land area dating to 2023-12-31 and population mean of 2024.
3. **Vehicle plate prefixes:** 34/34 current province assignments from Appendix 02 Circular 51/2025/TT-BCA; 63/63 legacy provinces from Appendix 02 Circular 79/2024/TT-BCA. All 80 assigned province prefixes are unique within each period. Code `80` is special (Cục CSGT).
4. Shared statistics card in the **Province Explorer**, **Map Explorer** (including group selection) and **Commune Explorer**. Commune statistics missing are explicitly marked unavailable; the province's plate codes are displayed for orientation.
5. Exact two-digit plate search in Province and Map Explorer, switching results with administrative period.
6. Documents, structured provenance sources, reproducible seed script and data validation; CI includes new test.

## Non-claims and outstanding work

- Historical commune GIS is still **0 verified provinces out of 63**. Reuse permission and polygon proof needed before V1.0 legal-accuracy claims. Do not silently generate historical commune polygons.
- National 2026 province population census figures are **not** provided or inferred. The 11 unchanged units rely on older NSO population (2024).
- No verified nationwide commune area/population dataset included. Do not infer proportional commune population from polygons.
- The two period-specific population measures are not directly comparable as growth.
- Runtime production build and external GIS provider reachability are not demonstrated by syntax/data checks alone.

## Release filenames

`VietWards-V0.8.0-Verified-Statistics-and-Plates.zip`

No SQL migrations. Next.js/Vercel setup carried forward from V0.7.0.
