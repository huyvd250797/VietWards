import assert from "node:assert/strict";
import * as old from "vn-local-divisions/legacy";
import * as now from "vn-local-divisions/current";
import * as conversion from "vn-local-divisions/convert";

const checks = [
  ["Tỉnh/thành cũ", old.getProvinces(), 63, 2],
  ["Đơn vị cấp huyện cũ", old.getDistricts(), 696, 3],
  ["Xã/phường/thị trấn cũ", old.getWards(), 10035, 5],
  ["Tỉnh/thành từ 01/07/2025", now.getProvinces(), 34, 2],
  ["Xã/phường/đặc khu từ 01/07/2025", now.getWards(), 3321, 5],
];
for (const [label, rows, expected, length] of checks) {
  assert.equal(rows.length, expected, `${label}: sai tổng số`);
  const codes = new Set(rows.map((item) => item.code));
  assert.equal(codes.size, rows.length, `${label}: mã trùng`);
  assert.ok(rows.every((row) => /^\d+$/.test(row.code) && row.code.length === length), `${label}: mã không đúng định dạng`);
  console.log(`OK ${label}: ${rows.length} mã`);
}
const oldP = new Set(old.getProvinces().map((p) => p.code));
const oldD = new Set(old.getDistricts().map((d) => d.code));
const currentP = new Set(now.getProvinces().map((p) => p.code));
assert.ok(old.getDistricts().every((d) => oldP.has(d.provinceCode)), "Huyện cũ có tỉnh cha không tồn tại");
assert.ok(old.getWards().every((w) => oldD.has(w.districtCode)), "Xã cũ có huyện cha không tồn tại");
assert.ok(now.getWards().every((w) => currentP.has(w.provinceCode)), "Xã mới có tỉnh cha không tồn tại");
const uncovered = old.getProvinces().filter((p) => !conversion.provinceToCurrent(p.code));
assert.equal(uncovered.length, 0, `Thiếu ánh xạ cấp tỉnh: ${uncovered.map((p) => p.name).join(", ")}`);
const currentCoverage = new Set(old.getProvinces().map((p) => conversion.provinceToCurrent(p.code)?.code));
assert.equal(currentCoverage.size, 34, "Số tỉnh hiện hành nhận được ánh xạ không đủ 34");
const changes = [
  ["Đồng Nai", ["Trảng Bom", "Long Thành", "Trị An", "Nhơn Trạch", "Tân Khai", "Xuân Lộc", "Tân Phú", "Lộc Ninh", "Dầu Giây", "Đồng Phú"]],
  ["Bắc Ninh", ["Yên Phong", "Tiên Du", "Chi Lăng", "Phù Lãng", "Lương Tài", "Gia Bình", "Nhân Thắng", "Hiệp Hòa", "Bố Hạ", "Lạng Giang", "Kép", "Lục Nam"]],
];
for (const [provinceName, names] of changes) {
  const province = now.getProvinces().find((p) => p.name.endsWith(provinceName));
  assert.ok(province, `Không tìm thấy ${provinceName}`);
  for (const name of names) {
    const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
    const matches = now.getWardsByProvinceCode(province.code).filter((w) => normalize(w.shortName) === normalize(name) && w.unit === "Xã");
    assert.equal(matches.length, 1, `${provinceName}: cần đúng 1 xã ${name} để chuyển thành phường`);
  }
}
console.log("PASS: tất cả mã, quan hệ tỉnh-cha/huyện-cha, phủ 63→34 và 22 chuyển đổi phường năm 2026.");
