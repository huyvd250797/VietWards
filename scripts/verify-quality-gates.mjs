import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=(p)=>fs.readFileSync(new URL(p,root),'utf8');
const stats=JSON.parse(read('src/data/verified-province-statistics.json'));
const src=JSON.parse(read('src/data/verified-sources.json'));
const manifest=JSON.parse(read('public/data/legacy/manifest.json'));
assert.equal(Object.keys(stats.data.current).length,34);
assert.equal(Object.keys(stats.data.before).length,63);
assert.ok(Object.values(src).every(s=>s.url?.startsWith('https://')));
for(const [period,entries] of Object.entries(stats.data)){
  const seen=new Set();
  for(const p of Object.values(entries)){
    assert.ok(p.area?.sourceId&&src[p.area.sourceId]);
    assert.ok(p.population?.sourceId&&src[p.population.sourceId]);
    assert.ok(p.plateSourceId&&src[p.plateSourceId]);
    assert.ok(p.area.valueKm2>0&&p.population.value>0);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(p.area.referenceDate));
    assert.ok(p.population.referencePeriod);
    assert.ok(p.plateCodes.length);
    for(const plate of p.plateCodes){assert.match(plate,/^\d{2}$/);assert.notEqual(plate,'80');assert.ok(!seen.has(plate),`Duplicate plate ${plate} in ${period}`);seen.add(plate);}
  }
}
const version=JSON.parse(read('package.json')).version;
assert.equal(version,'1.1.1');
assert.ok(read('src/lib/config.ts').includes('version: "1.1.1"'));
assert.ok(read('public/sw.js').includes('v1.1.1'));
assert.ok(read('src/components/app-shell.tsx').includes('"/hoc-dia-ly"'));
assert.ok(read('src/app/hoc-dia-ly/page.tsx').includes('getLearningPayload'));
const files=['src/components/educational-explorer.tsx','src/components/educational-map.tsx','src/lib/education-model.ts','src/app/educational.css','e2e/education.spec.ts'];
assert.ok(files.every(p=>fs.existsSync(new URL(p,root))),`Missing educational file`);
const legacyCount=Array.isArray(manifest.provinces)?manifest.provinces.length:Object.keys(manifest.provinces||{}).length;
assert.equal(legacyCount,0,'No uncertified pre-2025 GIS can enter release unnoticed');
console.log(`PASS quality: 97 sourced statistical records, unique plates in each snapshot, missing historical GIS clearly gated (0/63), V1.1.1 version and educational assets.`);
