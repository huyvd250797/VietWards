/** Optional networked probe. Run in CI/online environment; no keys required. */
import assert from "node:assert/strict";
const cases = [
  { period: "current", count: 34, url: "https://raw.githubusercontent.com/truongdinh018/GeoVN/main/data/provinces.geojson" },
  { period: "before", count: 63, url: "https://maps.pispace.eu/data-download/?file=vietnam-regions.geojson&set=vietnam" },
];
for (const { period, count, url } of cases) {
  const response = await fetch(url, { signal: AbortSignal.timeout(18000), headers: { Accept: "application/geo+json,application/json,*/*" } });
  assert.equal(response.status, 200, `${period}: GIS HTTP error`);
  const body = await response.json();
  assert.equal(body.type, "FeatureCollection", `${period}: invalid collection`);
  assert.equal(body.features?.length, count, `${period}: expected ${count} polygons`);
  assert.ok(body.features.every((feature) => ["Polygon", "MultiPolygon"].includes(feature.geometry?.type)), `${period}: invalid geometries`);
  console.log(`PASS ${period}: ${count} polygons, ${url}`);
}
console.log("Source polygons are reachable. This does not verify legal boundary accuracy or canonical code matching.");
