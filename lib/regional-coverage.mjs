// Phase 12: date-overlap coverage for both worldwide and location-specific events.
import {isCalendarDateKey} from './weekly-calendar.mjs';
export function regionalCoverage(events,from,through){
 if(!isCalendarDateKey(from)||!isCalendarDateKey(through)||from>through)throw Error('Invalid reporting window');
 const relevant=(Array.isArray(events)?events:[]).filter(e=>isCalendarDateKey(e.start)&&isCalendarDateKey(e.end)&&e.start<=through&&e.end>=from);
 const global=[],regional=[],review=[];
 for(const e of relevant){
  const item={id:e.id,name:e.name,start:e.start,end:e.end,zone:e.zone||null,source:e.source||null};
  if(e.zone)regional.push(item);else global.push(item);
  if(!e.source||!/^https:\/\//.test(e.source))review.push({...item,reason:'Missing verified source'});
  if(e.zone&&e.zone.length>100)review.push({...item,reason:'Review regional zone'});
 }
 const byZone=Object.entries(regional.reduce((acc,e)=>{acc[e.zone]=(acc[e.zone]||0)+1;return acc},{})).sort((a,b)=>b[1]-a[1]).map(([zone,count])=>({zone,count}));
 return {from,through,total:relevant.length,globalCount:global.length,regionalCount:regional.length,global,regional,byZone,review};
}
