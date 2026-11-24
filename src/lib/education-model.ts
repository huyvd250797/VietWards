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
  category: "plate"|"history"|"area"|"map"|"population"|"communes";
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


/** V1.0.2 — A sourced question BANK, independent from the exam session.
 * Bank creation is deterministic; only assembling an exam uses randomness.
 * Every question is single-answer, has a stable ID, and never fabricates a statistic.
 */
export function generateQuizBank(catalog: LearningCatalog, period: LearningPeriod): QuizQuestion[] {
  const rows = catalog[period];
  const bank: QuizQuestion[] = [...generateQuestions(catalog, period)];
  const seen = new Set(bank.map((q) => q.id));
  const add = (q: QuizQuestion) => { if (!seen.has(q.id) && q.options.some((o) => o.value === q.answer)) { seen.add(q.id); bank.push(q); } };
  const alternatives = (correct: LearningProvince, index: number, pool = rows): QuizQuestion["options"] => {
    const others = pool.filter((p) => p.code !== correct.code);
    // Walk the whole pool rather than always selecting the first three provinces.
    const offset = others.length ? (index * 7 + 3) % others.length : 0;
    const distractors = [...others.slice(offset), ...others.slice(0, offset)].slice(0, 3);
    return [correct, ...distractors].sort((a, b) => a.code.localeCompare(b.code)).map((p) => ({ value: p.code, label: p.name }));
  };
  // Exactly one answer for each plate in the period. Exclude nationwide/special code 80.
  const plateOwners = new Map<string, LearningProvince[]>();
  for (const p of rows) for (const plate of p.plates) {
    if (plate === "80") continue;
    plateOwners.set(plate, [...(plateOwners.get(plate) ?? []), p]);
  }
  for (const [plate, owners] of plateOwners) {
    if (owners.length !== 1) continue;
    const owner = owners[0];
    add({ id: `bank-plate-${period}-${plate}`, mode: "choice", category: "plate",
      title: `Biển số ${plate} thuộc tỉnh/thành nào ở thời kỳ ${period === "current" ? "hiện hành" : "trước sáp nhập"}?`,
      options: alternatives(owner, Number(plate) || 0), answer: owner.code,
      explanation: `Theo bảng ký hiệu biển số của thời kỳ đang xem, mã ${plate} thuộc ${owner.name}.`,
      sourceIds: owner.plateSourceId ? [owner.plateSourceId] : [] });
  }
  // Map identification works even if GIS is unavailable: the name choices remain usable.
  for (const [index, province] of rows.entries()) {
    add({ id: `bank-map-${period}-${province.code}`, mode: "map", category: "map",
      title: `Hãy chọn vị trí ${province.name} trên bản đồ hành chính.`,
      options: alternatives(province, index), answer: province.code,
      explanation: `${province.name} là đơn vị hành chính mã ${province.code} trong kỳ đang xem. Bản đồ GIS mang tính tham khảo.`,
      sourceIds: [] });
  }
  // History quiz: target a VERIFIED predecessor by administrative relation, not geometry.
  if (period === "current") {
    for (const [index, province] of rows.entries()) {
      if (province.predecessors.length < 2) continue;
      const before = catalog.before;
      const sourceCodes = new Set(province.predecessors.map((p) => p.code));
      for (const source of province.predecessors) {
        const others = before.filter((p) => !sourceCodes.has(p.code));
        if (others.length < 3) continue;
        const offset = (index * 5 + Number(source.code)) % others.length;
        const wrong = [...others.slice(offset), ...others.slice(0, offset)].slice(0, 3);
        const choices = [{ value: source.code, label: source.name }, ...wrong.map((p) => ({ value: p.code, label: p.name }))]
          .sort((a, b) => a.value.localeCompare(b.value));
        add({ id: `bank-history-${province.code}-${source.code}`, mode: "choice", category: "history",
          title: `Địa phương nào là một trong các tỉnh/thành tiền thân của ${province.name}?`,
          options: choices, answer: source.code,
          explanation: `${province.name} được hình thành từ: ${province.predecessors.map((p) => p.name).join("; ")}.`,
          sourceIds: ["resolution-202-2025"] });
      }
    }
  }
  // Only compare measurements from the SAME reference period/method.
  for (const [index, a] of rows.entries()) {
    const candidates = [...rows.slice(index + 1), ...rows.slice(0, index)].filter((b) => b.code !== a.code);
    const bArea = candidates.find((b) => a.area && b.area && a.area.referenceDate === b.area.referenceDate && Math.abs(a.area.value - b.area.value) > 1);
    if (a.area && bArea?.area) {
      const larger = a.area.value > bArea.area.value ? a : bArea;
      add({ id: `bank-area-${period}-${[a.code,bArea.code].sort().join("-")}`, mode: "choice", category: "area",
        title: `Theo diện tích cùng mốc ${a.area.referenceDate}, địa phương nào rộng hơn?`,
        options: [{ value: a.code, label: a.name }, { value: bArea.code, label: bArea.name }], answer: larger.code,
        explanation: `${a.name}: ${a.area.value.toLocaleString("vi-VN")} km²; ${bArea.name}: ${bArea.area.value.toLocaleString("vi-VN")} km².`,
        sourceIds: [...new Set([a.area.sourceId, bArea.area.sourceId])] });
    }
    const bPopulation = candidates.find((b) => a.population && b.population &&
      a.population.kind === b.population.kind && a.population.referencePeriod === b.population.referencePeriod &&
      Math.abs(a.population.value - b.population.value) > 100);
    if (a.population && bPopulation?.population) {
      const larger = a.population.value > bPopulation.population.value ? a : bPopulation;
      add({ id: `bank-pop-${period}-${[a.code,bPopulation.code].sort().join("-")}`, mode: "choice", category: "population",
        title: `Theo ${a.population.kind === "administrative_scale" ? "quy mô dân số hành chính" : "dân số thống kê"} cùng kỳ ${a.population.referencePeriod}, địa phương nào đông hơn?`,
        options: [{ value: a.code, label: a.name }, { value: bPopulation.code, label: bPopulation.name }], answer: larger.code,
        explanation: `${a.name}: ${a.population.value.toLocaleString("vi-VN")} người; ${bPopulation.name}: ${bPopulation.population.value.toLocaleString("vi-VN")} người (cùng kỳ).`,
        sourceIds: [...new Set([a.population.sourceId, bPopulation.population.sourceId])] });
    }
    const bCommune = candidates.find((b) => b.communeCount !== a.communeCount);
    if (bCommune) {
      const more = a.communeCount > bCommune.communeCount ? a : bCommune;
      add({ id: `bank-communes-${period}-${[a.code,bCommune.code].sort().join("-")}`, mode: "choice", category: "communes",
        title: `Theo danh mục hành chính ${period === "current" ? "hiện hành" : "trước sáp nhập"}, địa phương nào có nhiều đơn vị cấp xã hơn?`,
        options: [{ value: a.code, label: a.name }, { value: bCommune.code, label: bCommune.name }], answer: more.code,
        explanation: `${a.name}: ${a.communeCount} đơn vị; ${bCommune.name}: ${bCommune.communeCount} đơn vị.`, sourceIds: [] });
    }
  }
  return bank;
}

export type QuizLength = 10 | 20 | 30;
export type MedalLevel = "none" | "bronze" | "silver" | "gold" | "diamond";
export type QuizResult = {
  period: LearningPeriod;
  length: QuizLength;
  correct: number;
  percentage: number;
  medal: MedalLevel;
  completedAt: string;
};

export function evaluateQuiz(period: LearningPeriod, length: QuizLength, correct: number, completedAt = new Date().toISOString()): QuizResult {
  if (!Number.isInteger(correct) || correct < 0 || correct > length) throw new Error("Điểm số không hợp lệ");
  const percentage = Math.round((correct / length) * 100);
  const medal: MedalLevel = percentage === 100 ? "diamond" : percentage >= 90 ? "gold" : percentage >= 80 ? "silver" : percentage >= 60 ? "bronze" : "none";
  return { period, length, correct, percentage, medal, completedAt };
}

/** Produce a fresh, non-repeated exam, without changing the source bank. */
export function createQuizExam(bank: QuizQuestion[], length: QuizLength, previousIds: string[] = [], random: () => number = Math.random): QuizQuestion[] {
  const unique = [...new Map(bank.map((q) => [q.id, q])).values()].filter((q) => q.options.some((o) => o.value === q.answer));
  if (unique.length < length) throw new Error(`Ngân hàng chỉ có ${unique.length} câu hợp lệ, không đủ tạo đề ${length} câu.`);
  const shuffled = [...unique];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let sample = shuffled.slice(0, length);
  if (previousIds.length === length && sample.every((q, i) => q.id === previousIds[i])) {
    if (shuffled.length > length) sample = [...sample.slice(0, -1), shuffled[length]];
    else sample = [...sample.slice(1), sample[0]];
  }
  return sample.map((question) => {
    const options = [...question.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { ...question, options };
  });
}

export function validateEducationalCatalog(catalog: LearningCatalog): { before: number; current: number; area: number; population: number; plate: number } {
  const all=[...catalog.current,...catalog.before];
  return {before:catalog.before.length,current:catalog.current.length,
    area:all.filter(p=>p.area?.value && p.area.value>0).length,
    population:all.filter(p=>p.population?.value && p.population.value>0).length,
    plate:all.filter(p=>p.plates.length>0).length};
}
