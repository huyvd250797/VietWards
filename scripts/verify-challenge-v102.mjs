import fs from "node:fs";
import assert from "node:assert/strict";
import {generateQuizBank,createQuizExam,evaluateQuiz} from "../src/lib/education-model.ts";

const stats=JSON.parse(fs.readFileSync(new URL("../src/data/verified-province-statistics.json",import.meta.url),"utf8"));
function make(period){
  return Object.values(stats.data[period]).map((p,i)=>({
    code:String(i+1).padStart(2,"0"),name:p.displayName,kind:"Tỉnh",communeCount:i+15,
    area:{value:p.area.valueKm2,referenceDate:p.area.referenceDate,sourceId:p.area.sourceId},
    population:{value:p.population.value,kind:p.population.kind,referencePeriod:p.population.referencePeriod,sourceId:p.population.sourceId},
    plates:p.plateCodes,plateSourceId:p.plateSourceId,predecessors:[]
  }));
}
const catalog={current:make("current"),before:make("before")};
for(const period of ["current","before"]){
  const bank=generateQuizBank(catalog,period);
  assert.ok(bank.length>=30,`${period}: bank requires 30 verified questions, received ${bank.length}`);
  const ids=bank.map(q=>q.id);
  assert.equal(new Set(ids).size,ids.length,`No duplicated IDs in ${period}`);
  assert.ok(bank.every(q=>q.options.some(o=>o.value===q.answer)),`${period}: every answer exists among choices`);
  assert.ok(bank.every(q=>!q.id.includes("plate-80")),`special plate 80 is not a province`);
  for(const length of [10,20,30]){
    // Identical pseudo-random sequences must not recreate the same exact exam.
    const first=createQuizExam(bank,length,[],()=>0);
    const second=createQuizExam(bank,length,first.map(q=>q.id),()=>0);
    assert.equal(first.length,length);assert.equal(second.length,length);
    assert.equal(new Set(first.map(q=>q.id)).size,length);
    assert.notDeepEqual(first.map(q=>q.id),second.map(q=>q.id));
    assert.ok(first.every(q=>q.options.some(o=>o.value===q.answer)));
    assert.ok(first.every(q=>new Set(q.options.map(o=>o.value)).size===q.options.length));
  }
  console.log(`PASS ${period}: ${bank.length} verified questions; 10/20/30 unique randomized exams`);
}
const thresholds=[
  [10,5,"none"],[10,6,"bronze"],[10,8,"silver"],[10,9,"gold"],[10,10,"diamond"],
  [20,11,"none"],[20,12,"bronze"],[20,16,"silver"],[20,18,"gold"],[20,20,"diamond"],
  [30,17,"none"],[30,18,"bronze"],[30,24,"silver"],[30,27,"gold"],[30,30,"diamond"],
];
for(const [length,correct,expected] of thresholds) assert.equal(evaluateQuiz("current",length,correct).medal,expected);
assert.throws(()=>evaluateQuiz("current",10,11));
assert.throws(()=>evaluateQuiz("current",10,-1));
const edu=fs.readFileSync(new URL("../src/components/educational-explorer.tsx",import.meta.url),"utf8");
const province=fs.readFileSync(new URL("../src/components/map-stage.tsx",import.meta.url),"utf8");
const commune=fs.readFileSync(new URL("../src/components/commune-explorer.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../src/app/globals.css",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../src/app/layout.tsx",import.meta.url),"utf8");
assert.match(edu,/createQuizExam\(bank,quizLength,previousExamIds\.current\)/);
assert.match(edu,/vietwards-quiz-achievements-v102/);
assert.match(edu,/setQuizResult\(result\)/);
assert.match(layout,/maximumScale: 1/);
assert.match(layout,/userScalable: false/);
for(const [label,src] of [["province",province],["commune",commune]]){
  assert.match(src,/is-map-fullscreen/,`${label} fullscreen overlay`);
  assert.match(src,/useMapFullscreen/,`${label} fullscreen resize/scroll`);
  assert.match(src,/gis-mobile-selection-bar/,`${label} selected CTA`);
  assert.match(src,/Xem chi tiết/,`${label} details accessible`);
}
assert.match(css,/\.gis-map-column\.is-map-fullscreen\{position:fixed/);
assert.match(css,/\.gis-map-column>\.gis-mobile-selection-bar\{position:absolute/);
console.log(`PASS V1.0.2: medal boundaries (${thresholds.length}), mobile PWA zoom contract, fullscreen and map-first details`);
