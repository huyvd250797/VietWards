# VietWards V0.4.0 — Release notes

**Date:** 2026-11-23

## Changed

- Province Explorer search normalized for Vietnamese names and two-character unit codes.
- Distinct province vs centrally governed city filter; matched code joins map and catalog.
- AppShell context now maintains period and province selection across client-side pages.
- Deep links support `/ban-do?period=current&province=75`, equivalent catalog URLs and history restoration.
- The map now renders its list from canonical administrative data, not remote GIS feature display names.
- Synced map highlight/zoom and list selection; GIS-unmatched polygon warnings remain visible.
- Copy/share map link; mobile selector bottom sheet and detail panel; keyboard Escape closes list.
- Version labels and PWA cache incremented, CI search tests included.

## Not included

- Historical split/merge polygons between snapshots — V0.5.0.
- Commune polygons — V0.6.0 and V0.7.0.
- Independently verified population, area, plate prefix — V0.8.0.

## Source/data caveats

GIS data is supplied by previously used third-party GeoJSON sources (current GeoVN, historical PiSpace/Natural Earth with fallback). Geometry is for educational/reference use, not the legally authoritative administrative border. Full production build and external GIS endpoint tests must be run after deploying with network access.
