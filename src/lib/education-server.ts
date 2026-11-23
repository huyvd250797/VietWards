import { getProvinceRows } from "@/lib/admin-data";
import { getVerifiedProvinceStats } from "@/lib/verified-statistics";
import sources from "@/data/verified-sources.json";
import { ADMIN_SOURCES } from "@/lib/admin-sources";
import type { LearningCatalog, LearningPeriod, LearningProvince, LearningSource } from "@/lib/education-model";

export function getLearningPayload(): { catalog: LearningCatalog; sources: LearningSource[] } {
  const byPeriod=(period:LearningPeriod):LearningProvince[]=>getProvinceRows(period).map(row=>{
    const data=getVerifiedProvinceStats(period,row.code);
    return {code:row.code,name:row.name,kind:row.kind,communeCount:row.communeCount,
      area:data?.area?{value:data.area.valueKm2,referenceDate:data.area.referenceDate,sourceId:data.area.sourceId}:null,
      population:data?.population?{value:data.population.value,kind:data.population.kind,referencePeriod:data.population.referencePeriod,sourceId:data.population.sourceId}:null,
      plates:data?.plateCodes??[],plateSourceId:data?.plateSourceId??null,
      predecessors:row.formerProvinces??[]};
  });
  return {catalog:{before:byPeriod("before"),current:byPeriod("current")},
    sources:[...Object.values(sources).map(s=>({id:s.id,title:s.title,organization:s.organization,url:s.url,issuedAt:s.issuedAt})),
      ...ADMIN_SOURCES.filter(s=>s.id==="resolution-202-2025"||s.id==="community-package").map(s=>({id:s.id,title:s.title,organization:s.issuer,url:s.url,issuedAt:s.effectiveFrom}))]};
}
