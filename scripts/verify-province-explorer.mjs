import fs from "node:fs";
import assert from "node:assert/strict";
import { normalizeProvinceSearch, provinceHref, searchProvinces } from "../src/lib/province-search.ts";

const fromRoot = (path) => fs.readFileSync(path, "utf8");
const map = fromRoot("src/components/map-stage.tsx");
const catalog = fromRoot("src/components/province-explorer.tsx");
const shell = fromRoot("src/components/app-shell.tsx");
const page = fromRoot("src/app/ban-do/page.tsx");
const config = fromRoot("src/lib/config.ts");
assert.match(config, /version: "0\.4\.0"/);
assert.match(map, /searchProvinces\(provinces, query, typeFilter\)/);
assert.match(catalog, /searchProvinces\(provinces, provinceQuery, typeFilter\)/);
assert.match(map, /selectedProvinceCode: selected/);
assert.match(catalog, /selectedProvinceCode: selectedCode/);
assert.match(shell, /selectedProvinceCode, changePeriod, selectProvince, navigateProvince/);
assert.match(shell, /window\.history\.replaceState/);
assert.match(page, /previous=\{getProvinceRows\("before"\)\}/);
assert.match(map, /aria-pressed=\{selected === province.code\}/);
assert.match(catalog, /provinceHref\("\/ban-do"/);

const rows = [
  { code: "01", name: "Thành phố Hà Nội", kind: "Thành phố Trung ương" },
  { code: "79", name: "Thành phố Hồ Chí Minh", kind: "Thành phố Trung ương" },
  { code: "75", name: "Thành phố Đồng Nai", kind: "Thành phố Trung ương" },
  { code: "20", name: "Tỉnh Lạng Sơn", kind: "Tỉnh" },
];
assert.equal(normalizeProvinceSearch("Đồng  Nai"), "dong nai");
assert.deepEqual(searchProvinces(rows, "Dong Nai").map((x) => x.code), ["75"]);
assert.deepEqual(searchProvinces(rows, "đồngnai").map((x) => x.code), ["75"]);
assert.deepEqual(searchProvinces(rows, "TPHCM").map((x) => x.code), ["79"]);
assert.deepEqual(searchProvinces(rows, "sài gòn").map((x) => x.code), ["79"]);
assert.deepEqual(searchProvinces(rows, "75").map((x) => x.code), ["75"]);
assert.deepEqual(searchProvinces(rows, "", "city").map((x) => x.code), ["75", "01", "79"]);
assert.deepEqual(searchProvinces(rows, "", "province").map((x) => x.code), ["20"]);
assert.equal(provinceHref("/ban-do", "before", "75"), "/ban-do?period=before&province=75");
assert.equal(provinceHref("/tinh-thanh", "current", "garbage"), "/tinh-thanh?period=current");
console.log("OK: V0.4.0 search, filtering, code matching, links and shared selection contracts");
