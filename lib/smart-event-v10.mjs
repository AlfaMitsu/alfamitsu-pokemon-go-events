import {isDated,isValidDate} from './event-intelligence.mjs';
export function personalizedEvents(events,savedIds,today,{area='all',category='all',status='all',from='',through='',query=''}={}){
 if(!Array.isArray(events)||!isValidDate(today))return [];
 const ids=new Set(savedIds||[]),q=String(query).trim().toLowerCase();
 return events.filter(e=>isDated(e)&&e.end>=today&&(area==='all'||(area==='regional'?Boolean(e.zone):!e.zone))&&(category==='all'||(e.category||'event')===category)&&(status==='all'||(status==='saved'?ids.has(e.id):status==='ongoing'?e.start<=today&&e.end>=today:e.start>today))&&(!from||!isValidDate(from)||e.end>=from)&&(!through||!isValidDate(through)||e.start<=through)&&(!q||[e.name,e.detail,e.zone,...(e.featuredPokemon||[])].filter(Boolean).join(' ').toLowerCase().includes(q))).sort((a,b)=>Number(ids.has(b.id))-Number(ids.has(a.id))||a.start.localeCompare(b.start)||a.name.localeCompare(b.name));
}
export function upcomingReminderCandidates(events,savedIds,today,days=7){
 if(!isValidDate(today))return [];
 const until=new Date(today+'T12:00:00Z');until.setUTCDate(until.getUTCDate()+days);const end=until.toISOString().slice(0,10);
 const ids=new Set(savedIds||[]);
 return (events||[]).filter(e=>ids.has(e.id)&&isDated(e)&&e.start>=today&&e.start<=end).sort((a,b)=>a.start.localeCompare(b.start));
}
export function auditSchedule(events,today){
 if(!isValidDate(today))return [];
 const issues=[],seen=new Set();
 for(const e of events||[]){
  if(!e||typeof e.id!=='string')continue;
  if(seen.has(e.id))issues.push({id:e.id,kind:'duplicate',message:'Duplicate event ID — owner review required'});seen.add(e.id);
  if(!isDated(e)){issues.push({id:e.id,kind:'dates',message:'Invalid or reversed date range'});continue}
  if(e.end<today)continue;
  if(!e.source)issues.push({id:e.id,kind:'source',message:'Missing verified source link'});
  if(/unconfirmed|datamine|tba/i.test((e.name||'')+' '+(e.detail||'')))issues.push({id:e.id,kind:'unconfirmed',message:'Unconfirmed event requires owner approval'});
  if(e.startTime&&!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(e.startTime))issues.push({id:e.id,kind:'hours',message:'Invalid start time'});
  if(e.endTime&&!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(e.endTime))issues.push({id:e.id,kind:'hours',message:'Invalid end time'});
 }
 return issues;
}
