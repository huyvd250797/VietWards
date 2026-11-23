# Third-party data notices

VietWards uses the `vn-local-divisions` npm package version `1.0.1`.

Copyright (c) 2026 mtri-git.

License: MIT License (https://github.com/mtri-git/vn-local-divisions/blob/main/LICENSE).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Data provenance according to upstream NOTICE: General Statistics Office (GSO), last legacy export 2025-07-18; current administrative catalogue 2025-08-05; old-to-new mapping from sapnhap.bando.com.vn as processed by vietnamadminunits. Full upstream notice: https://github.com/mtri-git/vn-local-divisions/blob/main/NOTICE.md.

Legal sources linked in `src/lib/admin-sources.ts` take precedence if there is a conflict. Government administrative data itself is not being claimed to be exclusively licensed by this MIT notice.

## V0.3.0 — GIS engine and cartographic data (23/11/2026)

**MapLibre GL JS** (https://github.com/maplibre/maplibre-gl-js): Open-source WebGL vector rendering engine; license BSD-3-Clause. Installed through npm during deployment. Respect third-party notices of its dependencies.

**GeoVN / Vietnamese Provinces Database** (https://github.com/truongdinh018/GeoVN and https://github.com/thanglequoc/vietnamese-provinces-database): The current 34-province GeoJSON is retrieved on-demand from the public source; the project claims MIT licensing for its code/data, but its GIS geometry is said to be derived from an official reference map. Its original third-party geometry rights and survey validity are **not independently verified**. VietWards links and credits this dataset and does not claim it is official.

**Natural Earth / PiSpace Maps** (https://maps.pispace.eu/data/vietnam/): pre-2025 63-province dataset supplied under Natural Earth public domain terms, generalized for educational mapping, not legal boundaries.

**thongnv99/vietnam-interactive-map** (https://github.com/thongnv99/vietnam-interactive-map): fallback publicly hosted 63-province GeoJSON; repository states MIT but attribution and original GIS source should be checked separately before redistribution.

No third-party GIS geometry is bundled into the distributed ZIP in this release; the server retrieves the source files when needed. If permission to rehost the GIS is not established, disable the corresponding source rather than claiming legal authorization.

## VietWards V0.6.0 — Commune / Ward boundary layer

- Community GIS viewer source: https://github.com/truongdinh018/GeoVN (`data/wards/{provinceCode}.geojson`).
- Upstream: https://github.com/thanglequoc/vietnamese-provinces-database, derived from the Bando.com.vn administrative reference map (collected March 13, 2026).
- The dataset repository is open source, but underlying cartographic/source-data licensing must be checked separately before production redistribution or commercial use.
- VietWards does not bundle these raw GIS polygons into the ZIP. The Next.js gateway requests an individual province's GeoJSON when needed and records the source in response metadata.
- These geometries are **reference material, not legally certified boundary coordinates**. Matched administrative codes do not by themselves validate geometry precision.

## V0.7.0 historical commune geometry

No third-party 2025-06-30 commune-level polygons are included in this release. The opt-in import interface under `public/data/legacy/` requires independent licensing, source attribution, dated verification and matching five-digit GSO codes. The previous PiSpace/Natural Earth reference applies to the older **province** layer only; it is not a certified old-commune boundary source.

## V0.8.0 — Official statistics & license plate codes

- Cục Thống kê / 2024 Statistical Yearbook, Table 19: area (31 Dec 2023), mean 2024 population (thousands rounded to one decimal). See `src/data/verified-sources.json`. Data were transcribed into the release's JSON; these are not GIS-derived measurements.
- Resolution 202/2025/QH15: administrative areas and administrative population sizes for 23 merged provinces/cities (2025), distinct from statistical mean population.
- Circular 79/2024/TT-BCA Appendix 02: old province vehicle plate prefixes in the pre-1 July 2025 snapshot.
- Circular 51/2025/TT-BCA Appendix 02: current 34-province plate prefixes from 1 July 2025; code 80 belongs to the Traffic Police Department.
- Legal instrument texts and government statistics are separately cited. The application's own code license does not grant ownership or legal certification over upstream official data. No mass-automated scraping or redistribution of third-party GIS geometry has been added in V0.8.0.
