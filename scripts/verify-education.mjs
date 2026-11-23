import fs from 'node:fs';
import assert from 'node:assert/strict';
import {areaComparison,populationComparison,densityComparison,generateQuestions,validateEducationalCatalog} from '../src/lib/education-model.ts';
const stats=JSON.parse(fs.readFileSync(new URL('../src/data/verified-province-statistics.json',import.meta.url),'utf8'));
const get=(period,key,code,predecessors=[])=>{
  const row=stats.data[period][key];
  assert.ok(row,`Missing ${period}:${key}`);
  return {code,name:row.displayName,kind:'Tỉnh',communeCount:10,
    area:{value:row.area.valueKm2,referenceDate:row.area.referenceDate,sourceId:row.area.sourceId},
    population:{value:row.population.value,kind:row.population.kind,referencePeriod:row.population.referencePeriod,sourceId:row.population.sourceId},
    plates:row.plateCodes,plateSourceId:row.plateSourceId,predecessors};
};
const dongNai=get('current','dong nai','75',[{code:'70',name:'Tỉnh Bình Phước'},{code:'75',name:'Tỉnh Đồng Nai'}]);
const hcm=get('current','ho chi minh','79');
const hanoi=get('current','ha noi','01');
const cantho=get('current','can tho','92');
const beforeDongNai=get('before','dong nai','75');
const binhPhuoc=get('before','binh phuoc','70');
const beforeHanoi=get('before','ha noi','01');
const beforeHcm=get('before','ho chi minh','79');
const catalog={current:[dongNai,hcm,hanoi,cantho],before:[beforeDongNai,binhPhuoc,beforeHanoi,beforeHcm]};
// Positive comparisons: Đồng Nai and HCMC are both administrative scale at the 2025 date.
const area=areaComparison(dongNai,hcm),population=populationComparison(dongNai,hcm);
assert.equal(area.valid,true);assert.equal(population.valid,true);
assert.equal(area.delta,12737.18-6772.59);
assert.equal(population.delta,4491408-14002598);
assert.equal(densityComparison(dongNai,hcm).valid,true);
// Negative comparisons must never claim a trend from mismatched snapshots.
assert.equal(populationComparison(dongNai,hanoi).valid,false);
assert.equal(densityComparison(dongNai,hanoi).valid,false);
assert.equal(areaComparison({...dongNai,area:{...dongNai.area,referenceDate:'2024-01-01'}},hcm).valid,false);
assert.equal(areaComparison({...dongNai,area:null},hcm).valid,false);
const current=generateQuestions(catalog,'current'),before=generateQuestions(catalog,'before');
assert.ok(current.length>=4);assert.ok(before.length>=2);
assert.equal(current.find(q=>q.id==='plate-current')?.answer,'75');
assert.equal(before.find(q=>q.id==='plate-before')?.answer,'70');
assert.equal(current.find(q=>q.id==='area-75-79')?.answer,'75');
assert.equal(current.find(q=>q.id==='merge-75')?.answer,'right');
assert.deepEqual(current.find(q=>q.id==='merge-75')?.sourceIds,['resolution-202-2025']);
assert.ok(current.every(q=>q.options.some(o=>o.value===q.answer)));
assert.ok(before.every(q=>q.options.some(o=>o.value===q.answer)));
assert.ok(current.filter(q=>q.mode==='map').every(q=>q.options.length>1));
assert.equal(validateEducationalCatalog(catalog).area,8);
const ui=fs.readFileSync(new URL('../src/components/educational-explorer.tsx',import.meta.url),'utf8');
const map=fs.readFileSync(new URL('../src/components/educational-map.tsx',import.meta.url),'utf8');
assert.ok(ui.includes('Chưa xác minh')&&ui.includes('areaComparison')&&ui.includes('populationComparison'));
assert.ok(map.includes('matched')&&map.includes('0.57')&&map.includes('fitBounds'));
console.log(`PASS education: ${current.length} current + ${before.length} historical questions; Đồng Nai vs HCMC: compatible 2025 metrics; mixed periods refused; map selection contracts present.`);
