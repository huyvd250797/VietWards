/** V0.9.0 educational view model: only canonical, sourced administrative statistics. */
export type LearningPeriod = "current" | "before";
export type LearningSource = { id: string; title: string; organization: string; url: string; issuedAt: string | null };
export type LearningProvince = {
  code: string;
  name: string;
  kind: string;
  communeCount: number;
  area: { value: number; referenceDate: string; sourceId: string } | null;
  population: { value: number; kind: "administrative_scale" | "statistical_average"; referencePeriod: string; sourceId: string } | null;
  plates: string[];
  plateSourceId: string | null;
  predecessors: { code: string; name: string }[];
};
export type LearningCatalog = Record<LearningPeriod, LearningProvince[]>;
export type Comparable = { valid: boolean; reason: string; delta: number | null; ratio: number | null };

export function populationComparison(a: LearningProvince, b: LearningProvince): Comparable {
  if (!a.population || !b.population) return {valid:false,reason:"Thiếu số liệu dân số đã xác minh.",delta:null,ratio:null};
  if (a.population.kind !== b.population.kind || a.population.referencePeriod !== b.population.referencePeriod) {
    return {valid:false,reason:"Khác loại dân số hoặc kỳ tham chiếu; không tính chênh lệch.",delta:null,ratio:null};
  }
  return {valid:true,reason:"Cùng loại và kỳ dân số.",delta:a.population.value-b.population.value,ratio:b.population.value>0?a.population.value/b.population.value:null};
}
export function areaComparison(a: LearningProvince,b: LearningProvince): Comparable {
  if (!a.area || !b.area) return {valid:false,reason:"Thiếu diện tích được xác minh.",delta:null,ratio:null};
  if (a.area.referenceDate!==b.area.referenceDate) return {valid:false,reason:"Khác thời điểm đo diện tích; không tính chênh lệch.",delta:null,ratio:null};
  return {valid:true,reason:"Cùng thời điểm tham chiếu diện tích.",delta:a.area.value-b.area.value,ratio:b.area.value>0?a.area.value/b.area.value:null};
}
export function densityComparison(a: LearningProvince,b: LearningProvince): Comparable {
  const population = populationComparison(a,b);
  const area = areaComparison(a,b);
  if (!population.valid || !area.valid || !a.population || !b.population || !a.area || !b.area) {
    return {valid:false,reason:"Mật độ không so sánh trực tiếp khi dữ liệu đầu vào khác loại/kỳ.",delta:null,ratio:null};
  }
  const da=a.population.value/a.area.value,db=b.population.value/b.area.value;
  return {valid:true,reason:"Mật độ tính từ dữ liệu tương thích.",delta:da-db,ratio:db>0?da/db:null};
}

export type QuizQuestion = {
  id: string;
  mode: "choice" | "map";
  category: "plate"|"history"|"area"|"map";
  title: string;
  options: Array<{value:string;label:string}>;
  answer: string;
  explanation: string;
  sourceIds: string[];
};

/** Deterministic questions with provenance. No guessed values and no ambiguous plates. */
export function generateQuestions(catalog: LearningCatalog, period: LearningPeriod): QuizQuestion[] {
  const provinces=catalog[period];
  const byCode=(code:string)=>provinces.find(p=>p.code===code);
  const qs:QuizQuestion[]=[];
  const matchPlate = (prefix:string) => provinces.filter(p=>p.plates.includes(prefix));
  const plateOwner=matchPlate("93");
  if (plateOwner.length===1) {
    const distractors=provinces.filter(p=>p.code!==plateOwner[0].code).slice(0,3);
    qs.push({id:`plate-${period}`,mode:"choice",category:"plate",title:`Biển số xe 93 thuộc địa phương nào ở thời kỳ ${period==="current"?"hiện tại":"trước sáp nhập"}?`,options:[...distractors,plateOwner[0]].sort((a,b)=>a.code.localeCompare(b.code)).map(p=>({value:p.code,label:p.name})),answer:plateOwner[0].code,explanation:`Mã 93 được quy định cho ${plateOwner[0].name} trong thời kỳ đang chọn.`,sourceIds:plateOwner[0].plateSourceId?[plateOwner[0].plateSourceId]:[]});
  }
  const dongNai=byCode("75");
  if (period==="current" && dongNai?.predecessors.length) {
    const correct=dongNai.predecessors.map(p=>p.name.replace(/^(Tỉnh|Thành phố)\s+/,"")).join(" + ");
    qs.push({id:"merge-75",mode:"choice",category:"history",title:"Thành phố Đồng Nai hiện tại được hình thành từ những tỉnh nào?",options:[
      {value:"right",label:correct},
      {value:"wrong1",label:"Đồng Nai + Tây Ninh"},
      {value:"wrong2",label:"Bình Phước + Bình Dương"},
      {value:"wrong3",label:"Đồng Nai + Lâm Đồng"},
    ],answer:"right",explanation:`Theo quan hệ sáp nhập hành chính: ${correct}.`,sourceIds:["resolution-202-2025"]});
  }
  if (period==="current") {
    const hcm=byCode("79");
    if (dongNai?.area && hcm?.area && dongNai.area.referenceDate===hcm.area.referenceDate) {
      const larger = dongNai.area.value>hcm.area.value?dongNai:hcm;
      qs.push({id:"area-75-79",mode:"choice",category:"area",title:"Theo diện tích cùng thời điểm tham chiếu, Đồng Nai hay TP. Hồ Chí Minh rộng hơn?",options:[{value:"75",label:dongNai.name},{value:"79",label:hcm.name}],answer:larger.code,explanation:`Diện tích lần lượt là ${dongNai.area.value.toLocaleString("vi-VN")} km² và ${hcm.area.value.toLocaleString("vi-VN")} km².`,sourceIds:[dongNai.area.sourceId,hcm.area.sourceId]});
    }
  }
  for (const p of [byCode("01"),byCode("75")]) {
    if (p) qs.push({id:`map-${p.code}-${period}`,mode:"map",category:"map",title:`Chạm đúng vùng ${p.name} trên bản đồ.`,options:provinces.filter(x=>x.code===p.code||["79","92","75","01"].includes(x.code)).slice(0,4).map(x=>({value:x.code,label:x.name})),answer:p.code,explanation:`Bạn đã xác định vị trí ${p.name} theo bản đồ GIS tham khảo.`,sourceIds:[]});
  }
  return qs;
}

export function validateEducationalCatalog(catalog: LearningCatalog): { before: number; current: number; area: number; population: number; plate: number } {
  const all=[...catalog.current,...catalog.before];
  return {before:catalog.before.length,current:catalog.current.length,
    area:all.filter(p=>p.area?.value && p.area.value>0).length,
    population:all.filter(p=>p.population?.value && p.population.value>0).length,
    plate:all.filter(p=>p.plates.length>0).length};
}
