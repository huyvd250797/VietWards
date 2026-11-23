import assert from "node:assert/strict";
import fs from "node:fs";
import { canonicalCommuneCode, filterCommunes, isValidProvinceCode, normalizeCommuneQuery } from "../src/lib/commune-search.ts";

assert.equal(canonicalCommuneCode("4"), "00004");
assert.equal(canonicalCommuneCode(4), "00004");
assert.equal(canonicalCommuneCode("25195"), "25195");
assert.equal(canonicalCommuneCode("123456"), null);
assert.equal(canonicalCommuneCode("12.34"), null);
assert.equal(canonicalCommuneCode(null), null);
assert.equal(isValidProvinceCode("75"), true);
assert.equal(isValidProvinceCode("750"), false);
assert.equal(normalizeCommuneQuery("  ĐỒNG  NAI!  "), "dongnai");
const rows = [
 { code: "25195", name: "Phường Bình Phước", kind: "Phường", provinceCode: "75" },
 { code: "00004", name: "Phường Ba Đình", kind: "Phường", provinceCode: "01" },
 { code: "20407", name: "Xã Tân Phú", kind: "Xã", provinceCode: "75" },
 { code: "33333", name: "Đặc khu Côn Đảo", kind: "Đặc khu", provinceCode: "79" },
];
assert.equal(filterCommunes(rows, "binh phuoc")[0].code, "25195");
assert.equal(filterCommunes(rows, "Ba Dinh")[0].code, "00004");
assert.equal(filterCommunes(rows, "25195")[0].name, "Phường Bình Phước");
assert.equal(filterCommunes(rows, "", "Xã").length, 1);
assert.equal(filterCommunes(rows, "", "Đặc khu").length, 1);
assert.equal(filterCommunes(rows, "pham").length, 0);

const route = fs.readFileSync("src/app/api/commune-boundaries/route.ts", "utf8");
assert.match(route, /data\/wards\/\$\{code\}\.geojson/, "Province-only GIS upstream is required");
assert.match(route, /byCode\.get\(geoCode\)/, "Match ward geometry using exact official code");
assert.match(route, /matchedCount: matched\.size/, "Return verifiable match count");
assert.match(route, /missingCodes/, "Report missing GIS regions");
const shell = fs.readFileSync("src/components/map-explorer.tsx", "utf8");
assert.match(shell, /level.*commune/);
assert.match(shell, /period === "before" \? previous : current/, "Both periods must support province selection in Map Explorer");
assert.match(shell, /onSelectWard/);
console.log("PASS: commune search, 5-digit codes, type filters, province-scoped GIS, missing regions, dual-period navigation and deep link.");
