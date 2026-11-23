# Verified Statistics & Plates — data provenance V0.8.0

Checked for release: **2026-11-23**, timezone Asia/Ho_Chi_Minh. All reported values include a `sourceId`. Values in current and historical records are not assumed valid at every later date.

## Sources and reference dates

| Source ID | Source | Used for | Reference |
|---|---|---|---|
| `nso-statistics-2024` | [Cục Thống kê, Niên giám thống kê 2024, Table 19](https://www.nso.gov.vn/wp-content/uploads/2025/06/NGTK-Cuc-TK-2024_BQ.pdf) | Legacy 63 provinces and 11 unchanged current provinces | Area 2023-12-31, statistical average population 2024 (100-person rounding) |
| `na-202-2025` | [National Assembly Resolution 202/2025/QH15](https://congbao.chinhphu.vn/tai-ve-van-ban-so-202-2025-qh15-45050-56708?format=pdf) | Area and administrative scale of population of 23 newly merged provinces | National Assembly data from June 2025, not statistical average population 2026 |
| `bca-79-2024` | [Bộ Công an, Circular 79/2024/TT-BCA, Appendix 02](https://congbao.chinhphu.vn/tai-ve-van-ban-so-79-2024-tt-bca-43337-53056?format=pdf) | Province plate code assignments BEFORE 2025-07-01 | Historical assignment |
| `bca-51-2025` | [Bộ Công an, Circular 51/2025/TT-BCA, Appendix 02](https://bocongan.gov.vn/media/bca-media/photo-library/20250722155624_718a2904-71b2-4a66-a97a-ea695f49cbeb-TT51.2025.TT.BCA.pdf) | Province plate codes AFTER 2025-07-01 | Province administrative snapshot; prefix 80 belongs to the central police department |

## Reproduction and quality gates

1. `scripts/seed-verified-data.py` contains manually transcribed official tables; run it to regenerate `src/data/verified-province-statistics.json` and `src/data/verified-sources.json`. Update the script and cite a new official publication when values need revising; do not edit generated JSON only.
2. Province stats are resolved through canonical IDs from `vn-local-divisions`; a normalized **unique** province name bridges the official published tables to those IDs. Never confuse plate prefixes with administrative IDs.
3. Data validation checks 63/34 entries, 23/11 population types, each source ID, format and uniqueness of all two-digit plate prefixes, and known critical examples (Đồng Nai current vs Bình Phước old, Ho Chi Minh City).
4. Density calculation (`population / area`) is displayed only for a single period's own area and population, with the measure type and reference dates visible. It must NOT be interpreted as current 2026 population density.
5. Commune area and population deliberately return `null` without enough verified administrative unit source data. For communes, provincial plate codes are presented as provincial codes, not a commune's own code.
6. Split/merge comparison lists actual former provinces with their own source dates and **never calculates population growth from unlike periods**.

## Known limitations

- Historical commune polygons remain unverified and unbundled, with provider-licensing limitations.
- No official land area/population dataset for every commune in both periods has been integrated.
- The 11 unchanged provinces do not have a newly asserted nationwide 2026 statistical mean in this release.
- Prefer the 2025 Statistical Yearbook or any new comparable official statistical release once reconciled across 34 and 63 provincial structures; do not silently mix differently dated source columns.
