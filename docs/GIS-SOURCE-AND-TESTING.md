# VietWards V0.3.0 — GIS source, validation and acceptance

## Scope

- Administrative boundary visualization **at province level only**.
- 34 modern features from GeoVN, and 63 legacy features from the open Natural Earth data provided by PiSpace Maps; fallback legacy GitHub source if main source fails.
- Two independent snapshots; no automatic trans-period split/merge until V0.5.0.
- Not official survey-grade or legally definitive boundaries.

## Retrieval and checks (server endpoint)

1. Strict allowlisted upstream URLs in source; no user-supplied proxy URLs.
2. Abort remote request after 14 seconds; try next source.
3. Reject non-2xx responses, non-GeoJSON, invalid geometries, datasets with feature count differing from expected 34/63, and payload larger than 10 MB.
4. Join each feature to the canonical `vn-local-divisions` province list using administrative code (current) or normalized local name (legacy).
5. **Never** fabricate missing polygons, codes or areas; report unmatched names and matchedCount in `metadata`.
6. Return source URL and note that geometry is for educational use only. CDN caching and source fetch revalidation apply.

## UX acceptance checks

- Desktop browser: 3-column map layout and map gestures, mouse and trackpad zoom, click polygon, overlay, border, fitBounds, reset.
- Mobile iPhone/Android: map fits column, one-finger drag, two-finger zoom, tap selection, controls, collapsible search list and information pane.
- Switch current/before: source is replaced, selection cleared, map reset; no duplicate map instances.
- Map click + list click go through the same `select` handler.
- MultiPolygon bounds computed by walking every ring, including detached portions/islands; does not compute only first ring bounds.
- If GIS upstream is unavailable: graceful error UI, retry button; **no misleading geometric substitute**.
- Current and legacy codes are stored as strings to preserve leading zeroes.

## Pending external QA

Due to npm registry and external GIS endpoints being unreachable from the packaging runtime, this source release can be syntax/structure checked here, but Vercel production build, geospatial matching coverage, upstream availability and actual UI behavior require verification on the deployed app. Do not describe those as passed until independently tested.

## Next work

V0.4.0: robust catalogue-to-map linking across pages, global search and keyboard accessibility.
V0.5.0: explicit old/current administrative mapping with spatial transitions.
V0.6/0.7: commune and ward GIS, including partially merged geometries.
V0.8.0: sourced statistical area/population/plate numbers.
