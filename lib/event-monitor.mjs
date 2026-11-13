// Phase 8 monitoring: source freshness and remote poster availability; no unverified auto-corrections.
export const MONITOR_IMAGE_HOSTS=new Set(['pbs.twimg.com','media.pocketgamer.com']);
export function monitorInventory(events,now=new Date()){
 const day=now.toISOString().slice(0,10),issues=[],remote=new Map(),sourceHosts=new Map();
 for(const e of events){
  if(!e||typeof e.id!=='string')continue;
  const dated=/^\d{4}-\d{2}-\d{2}$/.test(e.start||'')&&/^\d{4}-\d{2}-\d{2}$/.test(e.end||'');
  const active=dated&&e.end>=day;
  if(active&&!e.source)issues.push({code:'ACTIVE_MISSING_SOURCE',severity:'warning',eventId:e.id,message:'Upcoming/ongoing event has no cited source.'});
  if(active&&!e.startTime&&!e.endTime)issues.push({code:'HOURS_UNVERIFIED',severity:'info',eventId:e.id,message:'Event hours are not provided; avoid exact-time reminders.'});
  if(active&&e.source){try{const u=new URL(e.source);if(u.protocol==='https:')sourceHosts.set(u.hostname,(sourceHosts.get(u.hostname)||0)+1)}catch{}}
  for(const value of [e.poster,e.onlineImage,...(e.additionalPosters||[]).map(x=>x.src)]){
   if(typeof value!=='string'||!value.startsWith('https://'))continue;
   try{const u=new URL(value);if(u.protocol==='https:'&&MONITOR_IMAGE_HOSTS.has(u.hostname)){if(!remote.has(value))remote.set(value,[]);remote.get(value).push(e.id)}}catch{}
  }
 }
 const current=events.filter(e=>typeof e.end==='string'&&e.end>=day);
 const future=events.filter(e=>typeof e.start==='string'&&e.start>day);
 if(!future.length)issues.push({code:'NO_FUTURE_EVENTS',severity:'warning',eventId:null,message:'No upcoming event records exist; verify event data freshness.'});
 return {day,events:events.length,current:current.length,upcoming:future.length,issues,remoteImages:[...remote.entries()].map(([url,eventIds])=>({url,eventIds:[...new Set(eventIds)]})),sourceHosts:[...sourceHosts.entries()].map(([host,count])=>({host,count}))};
}
export async function checkRemoteImages(targets,{limit=20,timeout=2800}={}){
 const checks=[];
 for(const target of targets.slice(0,limit)){
  let status='manual-review',httpStatus=null,note='Remote response inconclusive.';
  try{
   const url=new URL(target.url);
   if(url.protocol!=='https:'||!MONITOR_IMAGE_HOSTS.has(url.hostname))continue;
   const response=await fetch(target.url,{method:'HEAD',redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(timeout)});
   httpStatus=response.status;
   if(response.status===404||response.status===410){status='unavailable';note='Remote server reports image missing.'}
   else if(response.ok&&(response.headers.get('content-type')||'').toLowerCase().startsWith('image/')){status='available';note='Image returned successfully.'}
   else note='HEAD request blocked or content type inconclusive; review manually.';
  }catch{note='Timeout or connection failure; not proof of a broken image.'}
  checks.push({...target,status,httpStatus,note});
 }
 return checks;
}
