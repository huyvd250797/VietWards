import assert from "node:assert/strict";
import fs from "node:fs";
import {
  emptyHistoricalSelection, singleSelection, switchHistoricalPeriod,
  historicHref, selectionFromParams, validateHistoricalSelection,
} from "../src/lib/historical-selection.ts";

// Representative synthetic fixtures: 1 predecessor, 2 predecessors, 3 predecessors.
// Real, full national relation invariants remain in scripts/verify-data.mjs.
const links = [
  { code: "01", formerProvinces: [{ code: "01", name: "Hà Nội" }] },
  { code: "75", formerProvinces: [{ code: "70", name: "Bình Phước" }, { code: "75", name: "Đồng Nai" }] },
  { code: "79", formerProvinces: [
    { code: "79", name: "Hồ Chí Minh" }, { code: "74", name: "Bình Dương" }, { code: "77", name: "Bà Rịa – Vũng Tàu" },
  ] },
];
const current75 = singleSelection("current", "75");
const before75 = switchHistoricalPeriod(current75, "before", links);
assert.equal(before75.mode, "group");
assert.equal(before75.originProvinceCode, "75");
assert.deepEqual(before75.selectedProvinceCodes, ["70", "75"]);
assert.equal(before75.selectedProvinceCode, "70");
assert.equal(switchHistoricalPeriod(before75, "current", links).selectedProvinceCode, "75");
assert.equal(switchHistoricalPeriod(singleSelection("before", "70"), "current", links).selectedProvinceCode, "75");
const before79 = switchHistoricalPeriod(singleSelection("current", "79"), "before", links);
assert.deepEqual(before79.selectedProvinceCodes, ["79", "74", "77"]);
assert.equal(before79.mode, "group");
assert.equal(switchHistoricalPeriod(before79, "current", links).selectedProvinceCode, "79");
const before01 = switchHistoricalPeriod(singleSelection("current", "01"), "before", links);
assert.equal(before01.mode, "single");
assert.deepEqual(before01.selectedProvinceCodes, ["01"]);
assert.equal(switchHistoricalPeriod(before01, "current", links).selectedProvinceCode, "01");
assert.deepEqual(switchHistoricalPeriod(emptyHistoricalSelection(), "before", links), emptyHistoricalSelection("before"));
assert.deepEqual(switchHistoricalPeriod(singleSelection("before", "99"), "current", links), emptyHistoricalSelection("current"));
const url = historicHref("/ban-do", before75);
const restored = validateHistoricalSelection(selectionFromParams(new URL(url, "https://example.org").searchParams, "current"), links);
assert.deepEqual(restored, before75);
const injected = validateHistoricalSelection(selectionFromParams(new URLSearchParams("period=before&province=70&group=70,79&origin=79"), "current"), links);
assert.deepEqual(injected, singleSelection("before", "70"), "Reject group mixing two different successors");
assert.equal(validateHistoricalSelection(singleSelection("before", "99"), links).selectedProvinceCode, null);
assert.equal(validateHistoricalSelection(singleSelection("current", "99"), links).selectedProvinceCode, null);
assert.equal(selectionFromParams(new URLSearchParams("period=before&province=70&group=70,garbage"), "current").mode, "single");
const map = fs.readFileSync("src/components/map-stage.tsx", "utf8");
const shell = fs.readFileSync("src/components/app-shell.tsx", "utf8");
const history = fs.readFileSync("src/app/lich-su/page.tsx", "utf8");
assert.match(shell, /switchHistoricalPeriod\(historicalSelection, nextPeriod, links\)/);
assert.match(map, /source\.setData\(/, "MapLibre GeoJSON source swaps without remount");
assert.match(map, /previous\.period === period/, "Camera zoom only changes on same-period selection");
assert.match(map, /HISTORY_COLORS/, "Multiple source provinces are independently colored");
assert.match(history, /MapWorkbench previous=\{before\} current=\{current\} historyMode/);
console.log("PASS: succession 1/2/3 predecessors, both directions, invalid codes, validated group URLs, camera-preservation contracts");
