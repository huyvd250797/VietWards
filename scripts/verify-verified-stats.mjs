import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=(s)=>JSON.parse(fs.readFileSync(new URL(s,import.meta.url),'utf8'));
const registry=read('../src/data/verified-province-statistics.json');
const sources=read('../src/data/verified-sources.json');
const { before, current }=registry.data;
const norm=(s)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/^(?:tinh |thanh pho |tp\.?\s*)/,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
assert.equal(registry.datasetVersion,'0.8.0');
assert.equal(Object.keys(before).length,63,'Historical area, population, and plate coverage must be 63 provinces');
assert.equal(Object.keys(current).length,34,'Contemporary coverage must be 34 provinces');
const seen=new Set();
for (const [period,rows] of Object.entries({before,current})) {
  const plateOwner = new Map();
  for (const [key,entry] of Object.entries(rows)) {
    assert.equal(norm(entry.displayName),key);
    assert.ok(entry.area.valueKm2>50 && entry.area.valueKm2<30000);
    assert.ok(entry.population.value>100000 && entry.population.value<18000000);
    assert.ok(['statistical_average','administrative_scale'].includes(entry.population.kind));
    assert.ok(entry.plateCodes.length>0 && new Set(entry.plateCodes).size===entry.plateCodes.length);
    assert.equal(entry.area.status,'verified');
    assert.equal(entry.population.status,'verified');
    assert.ok(sources[entry.area.sourceId]); assert.ok(sources[entry.population.sourceId]); assert.ok(sources[entry.plateSourceId]);
    for (const code of entry.plateCodes) {
      assert.match(code,/^\d{2}$/);
      assert.notEqual(code,'80','Traffic Police Department is not a province');
      assert.ok(!plateOwner.has(code),`Plate ${code} assigned to two provinces within ${period}`);
      plateOwner.set(code,key);
    }
    if(period==='before'){
      assert.equal(entry.population.kind,'statistical_average');
      assert.equal(entry.area.referenceDate,'2023-12-31');
      assert.equal(entry.population.referencePeriod,'2024');
    }
  }
  assert.equal(plateOwner.get('93'),period==='before'?'binh phuoc':'dong nai');
  assert.equal(plateOwner.get('60'),'dong nai');
  assert.equal(plateOwner.get('29'),'ha noi');
  seen.add(`${period}:${plateOwner.size}`);
}
const merged=Object.values(current).filter(x=>x.population.kind==='administrative_scale');
const unchanged=Object.values(current).filter(x=>x.population.kind==='statistical_average');
assert.equal(merged.length,23);
assert.equal(unchanged.length,11);
assert.equal(current['dong nai'].area.valueKm2,12737.18);
assert.equal(current['dong nai'].population.value,4491408);
assert.deepEqual(current['dong nai'].plateCodes,['39','60','93']);
assert.deepEqual(before['dong nai'].plateCodes,['39','60']);
assert.deepEqual(before['binh phuoc'].plateCodes,['93']);
assert.deepEqual(current['tp. ho chi minh']?.plateCodes,undefined); // normalized key is ho chi minh
assert.equal(current['ho chi minh'].plateCodes.length,13);
assert.ok(current['ha noi'].population.kind==='statistical_average');
for (const source of Object.values(sources)) {
  assert.equal(new URL(source.url).protocol,'https:');
  assert.ok(source.title && source.organization && source.notes);
}
const api=fs.readFileSync(new URL('../src/app/api/verified-stats/route.ts',import.meta.url),'utf8');
assert.ok(api.includes('getUnitByCode')===false || api.includes('getVerifiedProvinceStats'));
assert.ok(api.includes('getVerifiedProvinceStats') && api.includes('findProvincesByPlate'));
const ui=fs.readFileSync(new URL('../src/components/verified-statistics-panel.tsx',import.meta.url),'utf8');
assert.ok(ui.includes('Chưa có diện tích và dân số cấp xã'));
assert.ok(ui.includes('Không nội suy') && ui.includes('Quy mô dân số'));
const directory=fs.readFileSync(new URL('../src/components/province-explorer.tsx',import.meta.url),'utf8');
const map=fs.readFileSync(new URL('../src/components/map-stage.tsx',import.meta.url),'utf8');
const commune=fs.readFileSync(new URL('../src/components/commune-explorer.tsx',import.meta.url),'utf8');
assert.ok(directory.includes('<VerifiedStatisticsPanel') && directory.includes('<LicensePlateLookup'));
assert.ok(map.includes('<VerifiedStatisticsPanel') && map.includes('<LicensePlateLookup'));
assert.ok(commune.includes('<VerifiedStatisticsPanel'));
console.log(`Verified statistics & plates OK: ${Object.keys(before).length} legacy, ${Object.keys(current).length} current, ${merged.length} administrative 2025, ${unchanged.length} statistical 2024; ${[...seen].join(', ')} plate prefixes.`);
