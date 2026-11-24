"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, CircleHelp, ClipboardCheck, Compass, Database, GitCompareArrows, GitMerge, GraduationCap, Map, RotateCcw, Ruler, ShieldAlert, Trophy, Users, Award, Gem, Medal, Sparkles, type LucideIcon } from "lucide-react";
import { useAtlas, PeriodToggle } from "./app-shell";
import { EducationalMap } from "./educational-map";
import { areaComparison, densityComparison, generateQuizBank, createQuizExam, evaluateQuiz, populationComparison, validateEducationalCatalog,
  type LearningCatalog, type LearningProvince, type LearningSource, type QuizQuestion, type QuizLength, type QuizResult, type MedalLevel } from "@/lib/education-model";

const fmt=(n:number)=>new Intl.NumberFormat("vi-VN",{maximumFractionDigits:2}).format(n);
const fmtPeople=(n:number)=>new Intl.NumberFormat("vi-VN",{maximumFractionDigits:0}).format(n);
const populationName=(kind:"administrative_scale"|"statistical_average")=>kind==="administrative_scale"?"Quy mô dân số hành chính":"Dân số trung bình thống kê";
type Tab="discover"|"compare"|"quiz"|"quality";
const TABS:[Tab,string,LucideIcon][]=[ ["discover","Khám phá",Compass], ["compare","So sánh",GitCompareArrows], ["quiz","Thử thách",Trophy], ["quality","Kiểm chứng",ClipboardCheck] ];

function SourceReference({sourceId,sources}:{sourceId:string|null|undefined;sources:LearningSource[]}){
  const source=sources.find(s=>s.id===sourceId);
  if(!source)return <span className="edu-data-source">Chưa có nguồn đủ xác minh</span>;
  return <a className="edu-data-source" href={source.url} target="_blank" rel="noreferrer"><BookOpen size={13}/>{source.organization} · {source.title}<ArrowUpRight size={12}/></a>;
}
function DataMetric({label,value,footnote,sourceId,sources,icon:Icon}:{label:string;value:string;footnote?:string;sourceId?:string|null;sources:LearningSource[];icon:LucideIcon}){
  return <div className="edu-metric"><div className="edu-metric-label"><Icon size={17}/>{label}</div><strong>{value}</strong>{footnote&&<small>{footnote}</small>}<SourceReference sourceId={sourceId} sources={sources}/></div>;
}
function CompareRow({label,a,b,comparison}:{label:string;a:string;b:string;comparison?:{valid:boolean;reason:string;delta:number|null};}){
  return <div className="edu-comparison-row"><div className="edu-comparison-label"><strong>{label}</strong>{comparison&&<small>{comparison.valid&&comparison.delta!==null?`Chênh lệch A − B: ${fmt(comparison.delta)}`:comparison.reason}</small>}</div><span>{a}</span><span>{b}</span></div>;
}

export function EducationalExplorer({catalog,sources}:{catalog:LearningCatalog;sources:LearningSource[]}){
  const {period} = useAtlas();
  const rows=catalog[period];
  const [tab,setTab]=useState<Tab>("compare");
  const [aCode,setACode]=useState("75");
  const [bCode,setBCode]=useState("79");
  const [focusedSlot,setFocusedSlot]=useState<"a"|"b">("a");
  const [tourCode,setTourCode]=useState("75");
  const [tourStep,setTourStep]=useState(0);
  const [quizLength,setQuizLength]=useState<QuizLength>(10);
  const [exam,setExam]=useState<QuizQuestion[]>([]);
  const previousExamIds=useRef<string[]>([]);
  const [quizIndex,setQuizIndex]=useState(0);
  const [quizAnswer,setQuizAnswer]=useState<string|null>(null);
  const [quizScore,setQuizScore]=useState(0);
  const [quizResult,setQuizResult]=useState<QuizResult|null>(null);
  const [quizError,setQuizError]=useState("");
  const [quizHistory,setQuizHistory]=useState<QuizResult[]>([]);
  const [quizAnswers,setQuizAnswers]=useState<Array<{question:QuizQuestion;chosen:string;correct:boolean}>>([]);
  const [showReview,setShowReview]=useState(false);
  const [initialized,setInitialized]=useState(false);
  const bank=useMemo(()=>generateQuizBank(catalog,period),[catalog,period]);
  const selectedA=rows.find(p=>p.code===aCode)??rows[0];
  const selectedB=rows.find(p=>p.code===bCode)??rows.find(p=>p.code!==selectedA?.code)??rows[0];
  const tour=rows.find(p=>p.code===tourCode)??rows[0];
  const coverage=useMemo(()=>validateEducationalCatalog(catalog),[catalog]);
  const question=exam[quizIndex];
  const correct=quizAnswer!==null&&question?.answer===quizAnswer;
  const completed=!!quizResult;
  const distinctProvinces=!!selectedA&&!!selectedB&&selectedA.code!==selectedB.code;
  const comparisonArea=distinctProvinces?areaComparison(selectedA,selectedB):null;
  const comparisonPopulation=distinctProvinces?populationComparison(selectedA,selectedB):null;
  const comparisonDensity=distinctProvinces?densityComparison(selectedA,selectedB):null;
  const density=(p:LearningProvince)=>p.area?.value&&p.population?.value?`${fmtPeople(Math.round(p.population.value/p.area.value))} người/km²`:"Chưa có dữ liệu";

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const raw=params.get("tab");
    const validTab=TABS.some(t=>t[0]===raw)?raw as Tab:"compare";
    const a=params.get("a"),b=params.get("b");
    const frame=requestAnimationFrame(()=>{
      setTab(validTab);
      if(a&&catalog.current.concat(catalog.before).some(p=>p.code===a))setACode(a);
      if(b&&catalog.current.concat(catalog.before).some(p=>p.code===b))setBCode(b);
      setInitialized(true);
    });
    return ()=>cancelAnimationFrame(frame);
  },[catalog]);
  useEffect(()=>{
    if(!initialized)return;
    const url=new URL(window.location.href);
    url.searchParams.set("period",period);
    url.searchParams.set("tab",tab);
    if(tab==="compare"){url.searchParams.set("a",selectedA?.code??"75");url.searchParams.set("b",selectedB?.code??"79");}
    else {url.searchParams.delete("a");url.searchParams.delete("b");}
    window.history.replaceState(window.history.state,"",url.pathname+url.search);
  },[initialized,period,tab,selectedA?.code,selectedB?.code]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      setExam([]);setQuizIndex(0);setQuizAnswer(null);setQuizScore(0);setQuizResult(null);setQuizAnswers([]);setQuizError("");setShowReview(false);
      previousExamIds.current=[];
      try {
        const raw=localStorage.getItem("vietwards-quiz-achievements-v102");
        const records=raw ? JSON.parse(raw) as QuizResult[] : [];
        setQuizHistory(Array.isArray(records)?records.filter((r)=>r && [10,20,30].includes(r.length) && r.correct<=r.length).slice(0,50):[]);
      } catch {setQuizHistory([]);}
    });
    return ()=>cancelAnimationFrame(frame);
  },[period]);

  const startExam=()=>{
    try {
      const next=createQuizExam(bank,quizLength,previousExamIds.current);
      previousExamIds.current=next.map(q=>q.id);
      setExam(next);setQuizIndex(0);setQuizAnswer(null);setQuizScore(0);
      setQuizResult(null);setQuizAnswers([]);setQuizError("");setShowReview(false);
    }catch(error){setQuizError(error instanceof Error?error.message:"Không thể tạo đề thi.");}
  };

  const selectMap=useCallback((code:string)=>{
    if(focusedSlot==="a")setACode(code);else setBCode(code);
  },[focusedSlot]);
  const advanceQuiz=()=>{
    if(!question||quizAnswer===null||quizResult)return;
    const isCorrect=quizAnswer===question.answer;
    const nextScore=quizScore+(isCorrect?1:0);
    setQuizScore(nextScore);
    setQuizAnswers(prev=>[...prev,{question,chosen:quizAnswer,correct:isCorrect}]);
    setQuizAnswer(null);
    if(quizIndex+1===exam.length){
      const result=evaluateQuiz(period,quizLength,nextScore);
      setQuizResult(result);
      setQuizIndex(exam.length);
      const nextHistory=[result,...quizHistory].slice(0,50);
      setQuizHistory(nextHistory);
      try{localStorage.setItem("vietwards-quiz-achievements-v102",JSON.stringify(nextHistory));}catch{/* Storage can be unavailable in private browsing. */}
    }else setQuizIndex(i=>i+1);
  };
  const bestOfLength=quizHistory.filter(r=>r.period===period && r.length===quizLength)
    .sort((a,b)=>b.correct-a.correct)[0]??null;
  const medalInfo:Record<MedalLevel,{label:string;icon:LucideIcon;detail:string}>={
    none:{label:"Chưa đạt huân chương",icon:Compass,detail:"Trả lời đúng ít nhất 60% để nhận huân chương Đồng."},
    bronze:{label:"Huân chương Đồng",icon:Medal,detail:"Đạt từ 60% câu đúng."},
    silver:{label:"Huân chương Bạc",icon:Medal,detail:"Đạt từ 80% câu đúng."},
    gold:{label:"Huân chương Vàng",icon:Award,detail:"Đạt từ 90% câu đúng."},
    diamond:{label:"Huân chương Kim cương",icon:Gem,detail:"Trả lời đúng tất cả câu hỏi."},
  };
  const finishMedal=quizResult?medalInfo[quizResult.medal]:null;
  const MedalIcon=finishMedal?.icon??Trophy;

  return <div className="edu-root">
    <div className="edu-main-toolbar"><div><span className="edu-overline"><GraduationCap size={15}/> LEARN VIETNAM</span><h2>Học qua bản đồ, không chỉ qua con số.</h2><p>Kiến thức từ danh mục hành chính có nguồn và ranh giới GIS tham khảo. Không yêu cầu tài khoản.</p></div><PeriodToggle/></div>
    <div className="edu-tabs" role="group" aria-label="Chế độ học địa lý">
      {TABS.map(([key,label,Icon])=><button key={key} type="button" aria-pressed={tab===key} className={tab===key?"active":""} onClick={()=>setTab(key)}><Icon size={17}/>{label}</button>)}
    </div>

    {tab==="compare"&&<section className="edu-section vw-card" aria-label="So sánh tỉnh thành">
      <div className="edu-section-head"><div><span className="edu-overline">TWO-PROVINCE COMPARISON</span><h2>So sánh hai địa phương</h2><p>Chọn hai tỉnh/thành để tô sáng đồng thời trên bản đồ và đối chiếu số liệu.</p></div><span className="edu-data-chip">{period==="current"?"34 tỉnh hiện tại":"63 tỉnh trước sáp nhập"}</span></div>
      <div className="edu-select-grid">
        {([{slot:"a",province:selectedA,value:aCode,change:setACode,label:"Địa phương A"},{slot:"b",province:selectedB,value:bCode,change:setBCode,label:"Địa phương B"}] as const).map(item=><div key={item.slot} className={`edu-select-card edu-slot-${item.slot} ${focusedSlot===item.slot?"focused":""}`}>
          <div className="edu-select-header"><span className={`edu-color-spot ${item.slot}`}/><strong>{item.label}</strong><button type="button" onClick={()=>setFocusedSlot(item.slot)} aria-pressed={focusedSlot===item.slot}>Chọn bằng bản đồ</button></div>
          <label><span className="edu-sr-only">{item.label}</span><select value={item.province?.code??""} onChange={event=>item.change(event.target.value)}>{rows.map(p=><option key={p.code} value={p.code}>{p.name}</option>)}</select></label>
          <small>Mã {item.province?.code} · {item.province?.kind}</small>
        </div>)}
      </div>
      {selectedA?.code===selectedB?.code&&<p className="edu-warning"><ShieldAlert size={16}/> Hai lựa chọn đang trùng nhau. Chọn hai tỉnh/thành khác nhau để đối chiếu.</p>}
      <div className="edu-compare-layout">
        <div className="edu-map-col"><EducationalMap period={period} selectedCodes={selectedA?.code!==selectedB?.code?[selectedA?.code,selectedB?.code].filter((x):x is string=>!!x):(selectedA?.code?[selectedA.code]:[])} onSelect={selectMap}/>
          <div className="edu-map-legend"><span><i className="edu-color-spot a"/> {selectedA?.name}</span><span><i className="edu-color-spot b"/> {selectedB?.name}</span><small>Chạm trên bản đồ để thay đổi {focusedSlot.toUpperCase()}</small></div>
        </div>
        <div className="edu-stat-col">
          <div className="edu-table-header"><span>CHỈ TIÊU</span><strong>{selectedA?.name}</strong><strong>{selectedB?.name}</strong></div>
          <CompareRow label="Diện tích" a={selectedA?.area?`${fmt(selectedA.area.value)} km²`:"Chưa xác minh"} b={selectedB?.area?`${fmt(selectedB.area.value)} km²`:"Chưa xác minh"} comparison={comparisonArea??undefined}/>
          <CompareRow label="Dân số" a={selectedA?.population?`${fmtPeople(selectedA.population.value)} người`:"Chưa xác minh"} b={selectedB?.population?`${fmtPeople(selectedB.population.value)} người`:"Chưa xác minh"} comparison={comparisonPopulation??undefined}/>
          <CompareRow label="Mật độ (tham khảo)" a={selectedA?density(selectedA):"—"} b={selectedB?density(selectedB):"—"} comparison={comparisonDensity??undefined}/>
          <CompareRow label="Đơn vị cấp xã" a={String(selectedA?.communeCount??0)} b={String(selectedB?.communeCount??0)}/>
          <CompareRow label="Biển số xe" a={selectedA?.plates.join(" · ")??"—"} b={selectedB?.plates.join(" · ")??"—"}/>
          <CompareRow label="Loại hình" a={selectedA?.kind??"—"} b={selectedB?.kind??"—"}/>
          <div className="edu-compare-provenance">
            {selectedA&&selectedB&&[selectedA,selectedB].map((p,i)=><div key={p.code}><strong><span className={`edu-color-spot ${i===0?"a":"b"}`}/>{p.name}</strong>
              <small>{p.area?`Diện tích tham chiếu: ${p.area.referenceDate}`:"Chưa có diện tích"}</small>
              <SourceReference sourceId={p.area?.sourceId} sources={sources}/>
              <small>{p.population?`${populationName(p.population.kind)} · kỳ ${p.population.referencePeriod}`:"Chưa có dân số"}</small>
              <SourceReference sourceId={p.population?.sourceId} sources={sources}/>
              <SourceReference sourceId={p.plateSourceId} sources={sources}/>
            </div>)}
          </div>
        </div>
      </div>
      <div className="edu-note"><ShieldAlert size={17}/><span>Số liệu dân số hành chính và thống kê không được cộng/trừ trực tiếp khi khác loại hoặc kỳ. Mật độ chỉ là phép chia từ các giá trị được dẫn nguồn, không thay thế số liệu mật độ chính thức. GIS chỉ là bản đồ tham khảo.</span></div>
      <div className="edu-history-line"><GitMerge size={18}/><div><strong>Khám phá địa giới trước và sau sáp nhập</strong><p>{selectedA?.name}: {selectedA?.predecessors?.length?selectedA.predecessors.map(p=>p.name).join(" + "):"Không có quan hệ tiền thân được ghi nhận ở thời kỳ này."}</p><p>{selectedB?.name}: {selectedB?.predecessors?.length?selectedB.predecessors.map(p=>p.name).join(" + "):"Không có quan hệ tiền thân được ghi nhận ở thời kỳ này."}</p></div><Link href={`/lich-su?period=${period}&province=${selectedA?.code??"75"}`}>Xem bản đồ lịch sử <ArrowUpRight size={16}/></Link></div>
    </section>}

    {tab==="discover"&&<section className="edu-section vw-card" aria-label="Lộ trình khám phá kiến thức">
      <div className="edu-section-head"><div><span className="edu-overline">GUIDED GEOGRAPHY</span><h2>Khám phá một tỉnh qua 5 bước</h2><p>Vị trí, diện tích, dân số, biển số xe và lịch sử hình thành, từng bước rõ nguồn.</p></div></div>
      <label className="edu-tour-select">Chọn địa phương<select value={tour?.code??""} onChange={event=>{setTourCode(event.target.value);setTourStep(0);}}>{rows.map(p=><option key={p.code} value={p.code}>{p.name}</option>)}</select></label>
      <div className="edu-stepper" role="group" aria-label="Các bước khám phá">{["Vị trí","Diện tích","Dân số","Biển số","Lịch sử"].map((label,i)=><button key={label} type="button" aria-pressed={tourStep===i} className={tourStep===i?"active":""} onClick={()=>setTourStep(i)}><span>{i+1}</span>{label}</button>)}</div>
      <div className="edu-tour-layout">
        <div className="edu-tour-main">
          <span className="edu-overline">BƯỚC {tourStep+1}/5</span>
          <h3>{tour?.name}</h3>
          {tourStep===0&&<><p>{tour?.kind} · Mã hành chính {tour?.code}. Chọn nút dưới để mở bản đồ, quan sát ranh giới và các tỉnh/thành lân cận.</p><Link className="edu-primary-button vw-button vw-button-primary" href={`/ban-do?period=${period}&province=${tour?.code}`}><Map size={16}/> Xem địa phương trên bản đồ <ArrowUpRight size={16}/></Link></>}
          {tourStep===1&&<DataMetric label="Diện tích tự nhiên" value={tour?.area?`${fmt(tour.area.value)} km²`:"Chưa xác minh"} footnote={tour?.area?`Ngày tham chiếu: ${tour.area.referenceDate}`:"Không nội suy từ GIS"} sourceId={tour?.area?.sourceId} sources={sources} icon={Ruler}/>}
          {tourStep===2&&<DataMetric label="Dân số" value={tour?.population?`${fmtPeople(tour.population.value)} người`:"Chưa xác minh"} footnote={tour?.population?`${populationName(tour.population.kind)} · kỳ ${tour.population.referencePeriod}`:"Không phân bổ dân số từ tỉnh khác"} sourceId={tour?.population?.sourceId} sources={sources} icon={Users}/>}
          {tourStep===3&&<><div className="edu-plate-set">{tour?.plates.map(p=><span key={p}>{p}</span>)}</div><p>Ký hiệu biển số xe của tỉnh/thành; không dùng mã biển số để suy ra địa chỉ chủ xe.</p><SourceReference sourceId={tour?.plateSourceId} sources={sources}/></>}
          {tourStep===4&&<>{tour?.predecessors.length?<><p>Địa phương này có các tỉnh/thành tiền thân ghi nhận trong dữ liệu hành chính:</p><div className="edu-predecessors">{tour.predecessors.map(p=><span key={p.code}>{p.name} · {p.code}</span>)}</div></>:<p>Không có quan hệ sáp nhập cấp tỉnh được ghi nhận trong thời kỳ đang xem.</p>}<Link className="edu-primary-button vw-button vw-button-primary" href={`/lich-su?period=${period}&province=${tour?.code}`}><GitMerge size={16}/> Xem lịch sử trên bản đồ</Link></>}
          <div className="edu-tour-buttons"><button type="button" disabled={tourStep===0} onClick={()=>setTourStep(v=>Math.max(0,v-1))}><ArrowLeft size={15}/> Trước</button><button type="button" onClick={()=>setTourStep(v=>(v+1)%5)}> {tourStep===4?"Học lại":"Tiếp theo"} <ArrowRight size={15}/></button></div>
        </div>
        <div className="edu-tour-aside"><div><Compass size={21}/><strong>Học theo cách của bạn</strong><p>Dữ liệu được trích từ VietWards, có mốc tham chiếu và liên kết nguồn. Bạn cũng có thể chuyển thời kỳ để xem kiến thức trước sáp nhập.</p></div><Link href="/ban-do">Khám phá trực tiếp trên bản đồ <ChevronRight size={15}/></Link></div>
      </div>
    </section>}

    {tab==="quiz"&&<section className="edu-section edu-challenge" aria-label="Trò chơi kiểm tra kiến thức">
      <div className="edu-section-head"><div><span className="edu-overline"><Sparkles size={15}/> GEOGRAPHY CHALLENGE</span><h2>Thử thách địa lý</h2><p>Ngân hàng {bank.length} câu dựa trên danh mục địa giới, diện tích, dân số cùng kỳ, biển số và lịch sử sáp nhập. Mỗi lần tạo đề sẽ chọn ngẫu nhiên, không lặp câu trong đề.</p></div><span className="edu-data-chip"><Trophy size={14}/> {quizHistory.filter(r=>r.period===period).length} lượt hoàn thành</span></div>
      {!exam.length?<div className="edu-quiz-setup">
        <div className="edu-quiz-intro vw-card-subtle"><div className="edu-quiz-intro-icon"><GraduationCap size={29}/></div><div><h3>Chọn độ dài đề thử thách</h3><p>Đề tự tạo từ kiến thức của thời kỳ đang xem. Mỗi câu đúng được 1 điểm, chỉ tính huân chương khi hoàn thành toàn bộ đề.</p></div></div>
        <div className="edu-exam-lengths" role="group" aria-label="Số câu hỏi trong đề">
          {([10,20,30] as QuizLength[]).map(length=><button type="button" key={length} className={quizLength===length?"active":""} aria-pressed={quizLength===length} onClick={()=>setQuizLength(length)} disabled={bank.length<length}><strong>{length}</strong><span>câu hỏi</span>{quizLength===length&&<CheckCircle2 size={17}/>}</button>)}
        </div>
        <div className="edu-medal-guide" aria-label="Quy tắc nhận huân chương"><h4><Medal size={18}/> Cách tính huân chương</h4><div><span>Đồng · ≥60%</span><span>Bạc · ≥80%</span><span>Vàng · ≥90%</span><span>Kim cương · 100%</span></div><small>Dưới 60% không nhận huân chương. Thành tích của đề 10, 20 và 30 câu được ghi riêng trên thiết bị.</small></div>
        {bestOfLength&&<div className="edu-personal-best"><Trophy size={18}/><span>Thành tích tốt nhất ({quizLength} câu): <strong>{bestOfLength.correct}/{quizLength} · {medalInfo[bestOfLength.medal].label}</strong></span></div>}
        {quizError&&<div className="edu-quiz-error" role="alert"><ShieldAlert size={17}/>{quizError}</div>}
        <button className="edu-primary-button edu-start-exam" type="button" disabled={bank.length<quizLength} onClick={startExam}><Sparkles size={18}/> Tạo đề ngẫu nhiên · {quizLength} câu <ArrowRight size={17}/></button>
      </div>:completed&&quizResult?<div className={`edu-quiz-finish edu-medal-${quizResult.medal}`}>
        <div className="edu-medal-emblem"><MedalIcon size={42} strokeWidth={1.8}/></div>
        <span className="edu-overline">HOÀN THÀNH THỬ THÁCH {quizResult.length} CÂU</span>
        <h3>{finishMedal?.label}</h3><strong className="edu-quiz-final-score">{quizResult.correct}/{quizResult.length} câu đúng · {quizResult.percentage}%</strong>
        <p>{finishMedal?.detail} Thành tích được lưu trên thiết bị này, không cần tài khoản.</p>
        <div className="edu-quiz-finish-actions"><button type="button" className="edu-primary-button vw-button vw-button-primary" onClick={startExam}><RotateCcw size={16}/> Ra đề khác</button><button type="button" onClick={()=>{setExam([]);setQuizResult(null);setQuizIndex(0);}}><ArrowLeft size={16}/> Đổi số câu</button><button type="button" onClick={()=>setShowReview(v=>!v)}><ClipboardCheck size={16}/>{showReview?"Ẩn đáp án":"Xem bài làm"}</button></div>
        {showReview&&<div className="edu-quiz-review" aria-label="Xem lại đáp án đã chọn">{quizAnswers.map(({question:q,chosen,correct:hit},i)=><div key={q.id}><strong className={hit?"right":"wrong"}>{i+1}. {hit?"Đúng":"Sai"} — {q.title}</strong><span>Bạn chọn: {q.options.find(o=>o.value===chosen)?.label??chosen}</span>{!hit&&<span>Đáp án đúng: {q.options.find(o=>o.value===q.answer)?.label??q.answer}</span>}<small>{q.explanation}</small></div>)}</div>}
      </div>:question&&<div className="edu-quiz-card vw-card-subtle">
        <div className="edu-quiz-progress"><span>Câu {quizIndex+1}/{exam.length}</span><span>{quizScore} câu đã trả lời đúng</span></div><div className="edu-progress"><span style={{width:`${(quizIndex/exam.length)*100}%`}}/></div>
        <div className="edu-quiz-type">{({plate:"Biển số xe",history:"Lịch sử sáp nhập",area:"Diện tích",map:"Vị trí địa lý",population:"Dân số",communes:"Địa giới cấp xã"} as const)[question.category]}</div>
        <h3>{question.title}</h3>
        {question.mode==="map"&&<div className="edu-quiz-map"><EducationalMap period={period} selectedCodes={quizAnswer!==null?[question.answer]:[]} quiz onSelect={code=>{if(quizAnswer===null)setQuizAnswer(code);}}/><small>Chạm vùng bản đồ để trả lời, hoặc chọn đáp án bên dưới nếu không thao tác được GIS.</small></div>}
        <div className="edu-quiz-answers" role="group" aria-label="Chọn câu trả lời">{question.options.map(option=><button type="button" key={option.value} disabled={quizAnswer!==null} className={quizAnswer!==null&&option.value===question.answer?"correct":quizAnswer===option.value?"incorrect":""} onClick={()=>setQuizAnswer(option.value)}><span>{option.label}</span>{quizAnswer!==null&&option.value===question.answer&&<CheckCircle2 size={17}/>}</button>)}</div>
        {quizAnswer!==null&&<div role="status" className={`edu-quiz-result ${correct?"right":"wrong"}`}><strong>{correct?"Chính xác!":"Chưa chính xác."}</strong> {question.explanation}<div className="edu-quiz-sources">{question.sourceIds.map(id=><SourceReference key={id} sourceId={id} sources={sources}/>)}</div></div>}
        <div className="edu-quiz-next"><button className="edu-primary-button vw-button vw-button-primary" type="button" disabled={quizAnswer===null} onClick={advanceQuiz}>{quizIndex===exam.length-1?"Xem kết quả & huân chương":"Câu tiếp theo"} <ArrowRight size={16}/></button></div>
      </div>}
      {quizHistory.some(r=>r.period===period)&&<div className="edu-quiz-achievements"><h3><Trophy size={19}/> Thành tích gần đây</h3><div>{quizHistory.filter(r=>r.period===period).slice(0,6).map((r,i)=>{const Icon=medalInfo[r.medal].icon;return <div key={`${r.completedAt}-${i}`}><Icon size={19}/><strong>{r.correct}/{r.length} câu</strong><span>{medalInfo[r.medal].label}</span><small>{new Date(r.completedAt).toLocaleDateString("vi-VN")}</small></div>;})}</div></div>}
    </section>}

    {tab==="quality"&&<section className="edu-section vw-card" aria-label="Trạng thái kiểm chứng dữ liệu">
      <div className="edu-section-head"><div><span className="edu-overline">DATA TRUST & QUALITY</span><h2>Minh bạch phạm vi dữ liệu</h2><p>Tách kiểm tra danh mục và thống kê khỏi chứng nhận pháp lý ranh giới GIS.</p></div></div>
      <div className="edu-quality-grid">
        <div><strong>{coverage.current}/34</strong><span>Tỉnh/thành hiện hành</span></div>
        <div><strong>{coverage.before}/63</strong><span>Tỉnh/thành lịch sử</span></div>
        <div><strong>{coverage.area}/97</strong><span>Bản ghi diện tích</span></div>
        <div><strong>{coverage.population}/97</strong><span>Bản ghi dân số có kỳ</span></div>
        <div><strong>{coverage.plate}/97</strong><span>Địa phương có biển số</span></div>
        <div className="edu-quality-open"><strong>0/63</strong><span>Tỉnh có GIS cấp xã lịch sử đã xác minh và đóng gói</span></div>
      </div>
      <div className="edu-quality-notes"><div><CheckCircle2 size={19}/><span><strong>Có nguồn dữ liệu</strong> — Bộ thống kê cấp tỉnh ghi rõ nguồn và ngày/kỳ tham chiếu. Mã biển số không đồng nghĩa mã hành chính.</span></div><div><ShieldAlert size={19}/><span><strong>Giới hạn GIS</strong> — Ranh giới cấp tỉnh và cấp xã hiện hành là dữ liệu tham khảo, chưa được chứng nhận địa giới pháp lý. GIS xã cũ chưa đủ để hiển thị trên bản đồ toàn quốc.</span></div><div><CircleHelp size={19}/><span><strong>Kiểm thử phát hành</strong> — Cú pháp và kiểm thử logic có thể chạy tự động; build Vercel, duyệt WebGL, accessibility và trình duyệt thật phải được kiểm chứng riêng.</span></div></div>
      <Link className="edu-text-link" href="/gioi-thieu"><Database size={16}/> Xem nguồn dữ liệu và roadmap <ArrowUpRight size={16}/></Link>
    </section>}
  </div>;
}
