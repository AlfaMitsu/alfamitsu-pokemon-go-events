import {isCalendarDateKey} from './weekly-calendar.mjs';
export function sourceStatus(source){
 if(typeof source!=='string'||!source.trim())return 'missing';
 try{const url=new URL(source);if(url.protocol!=='https:')return 'invalid';return ['pokemongo.com','www.pokemongo.com'].includes(url.hostname.toLowerCase())?'official':'third-party'}catch{return 'invalid'}
}
export function regionalIntegrity(events,from,through){
 if(!isCalendarDateKey(from)||!isCalendarDateKey(through)||from>through)throw Error('Invalid date range');
 const active=(Array.isArray(events)?events:[]).filter(e=>isCalendarDateKey(e.start)&&isCalendarDateKey(e.end)&&e.start<=through&&e.end>=from);
 const counts={official:0,'third-party':0,missing:0,invalid:0};
 const findings=[];
 for(const e of active){
  const status=sourceStatus(e.source);counts[status]++;
  if(status==='missing'||status==='invalid')findings.push({id:e.id,name:e.name,kind:'source',status,zone:e.zone||null});
  if(e.zone&&!/location-specific|see source|varies|global|local time/i.test(e.zone)){try{new Intl.DateTimeFormat('en-US',{timeZone:e.zone})}catch{findings.push({id:e.id,name:e.name,kind:'timezone',status:'invalid',zone:e.zone})}}
  if(e.start>e.end)findings.push({id:e.id,name:e.name,kind:'dates',status:'invalid',zone:e.zone||null});
 }
 return {from,through,counts,findings,checkedEvents:active.length,notes:'Official domain is not proof that an event is confirmed. Third-party sources need independent verification.'};
}
export function exportCoverageCsv(events){
 const columns=['id','name','start','end','zone','source','sourceStatus'];
 const escape=v=>'"'+String(v??'').replace(/"/g,'""').replace(/^\s*[=+@\-]/,"'.replace(/^[=+@\-\t\r]/,'\'$&')")+'"';
 return [columns.join(','),...(events||[]).map(e=>[e.id,e.name,e.start,e.end,e.zone,e.source,sourceStatus(e.source)].map(escape).join(','))].join('\r\n')+'\r\n';
}
