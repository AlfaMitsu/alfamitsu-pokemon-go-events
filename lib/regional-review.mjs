import {regionalIntegrity} from './regional-integrity.mjs';
import {regionalCoverage} from './regional-coverage.mjs';
export function regionalReview(events,from,through){
 const coverage=regionalCoverage(events,from,through);
 const integrity=regionalIntegrity(events,from,through);
 const sourceById=new Map(integrity.findings.filter(x=>x.kind==='source').map(x=>[x.id,x.status]));
 const timezoneById=new Set(integrity.findings.filter(x=>x.kind==='timezone').map(x=>x.id));
 const seen=new Map(),items=[];
 for(const event of [...coverage.global,...coverage.regional]){
  const key=[event.name?.trim().toLocaleLowerCase(),event.start,event.end,event.zone||'global'].join('|');
  const duplicate=seen.get(key);if(!duplicate)seen.set(key,event.id);
  const issues=[];
  if(sourceById.has(event.id))issues.push('Source: '+sourceById.get(event.id));
  if(timezoneById.has(event.id))issues.push('Invalid timezone');
  if(duplicate)issues.push('Potential duplicate of '+duplicate);
  if(issues.length)items.push({...event,issues});
 }
 return {from,through,reviewCount:items.length,items,globalCount:coverage.globalCount,regionalCount:coverage.regionalCount,notes:'Potential duplicates and missing sources are review suggestions, not automatic changes.'};
}
