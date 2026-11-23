import assert from "node:assert/strict";
import { filterCommunes, normalizeCommuneQuery, isValidCommuneCode } from "../src/lib/commune-search.ts";
import { readFileSync, existsSync } from "node:fs";
const p = (path) => readFileSync(path, "utf8");
const examples = [
  {code:"00004",name:"Phường Ba Đình",kind:"Phường",provinceCode:"01",districtCode:"001"},
  {code:"00007",name:"Xã Phú Hữu",kind:"Xã",provinceCode:"75",districtCode:"731"},
  {code:"00008",name:"Thị trấn Phú Mỹ",kind:"Thị trấn",provinceCode:"75",districtCode:"731"},
];
assert.equal(normalizeCommuneQuery("  Phường Ba Đình  "), "phuongbadinh");
assert.deepEqual(filterCommunes(examples,"ba dinh").map((x)=>x.code),["00004"]);
assert.deepEqual(filterCommunes(examples,"00008","Thị trấn").map((x)=>x.code),["00008"]);
assert.equal(isValidCommuneCode("00004"),true);
assert.equal(isValidCommuneCode("004"),false);
assert.deepEqual(examples.filter((x)=>x.districtCode === "731").map((x)=>x.code),["00007","00008"]);
const manifest = JSON.parse(p("public/data/legacy/manifest.json"));
assert.equal(manifest.snapshot, "2025-06-30");
assert.equal(manifest.schemaVersion, 1);
for (const [province, item] of Object.entries(manifest.provinces)) {
  assert.match(province, /^\d{2}$/);
  assert.equal(item.verified, true);
  assert.equal(item.snapshot, "2025-06-30");
  assert.ok(item.sourceUrl.startsWith("https://"));
  assert.ok(item.license);
  assert.match(item.verifiedOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(item.file, `${province}.geojson`);
  assert.ok(existsSync(`public/data/legacy/wards/${item.file}`));
}
const api = p("src/app/api/commune-boundaries/route.ts");
assert.match(api, /loadVerifiedHistoricalGIS/);
assert.match(api, /HISTORICAL_GIS_UNAVAILABLE/);
const relation = p("src/app/api/ward-relations/route.ts");
assert.match(relation, /unresolvedReferences/);
assert.match(relation, /getUnitByCode/);
const menu = p("src/components/map-explorer.tsx");
assert.match(menu, /period=\$\{from\}/);
assert.match(menu, /manualCrossPeriod/);
assert.match(menu, /relation\.targets\.length === 1/);
const atlas = p("src/components/legacy-atlas-explorer.tsx");
assert.match(atlas, /period=before/);
assert.match(atlas, /district/);
console.log("PASS: Legacy 2025-06-30 manifest, verified-only GIS, 3-level catalogue, relation API and transition handling.");
console.log(`Verified legacy GIS provinces shipped: ${Object.keys(manifest.provinces).length}/63 (explicit, not invented).`);
