// Pure calendar helpers: browser-local week anchoring without DST-sensitive millisecond arithmetic.
// Shared with Node regression tests and the existing GO Weekly page.
const isoPattern=/^\d{4}-\d{2}-\d{2}$/;
export function isCalendarDateKey(value){
 if(typeof value!=='string'||!isoPattern.test(value))return false;
 const date=new Date(value+'T12:00:00Z');
 return Number.isFinite(date.valueOf())&&date.toISOString().slice(0,10)===value;
}
function localKey(now){
 return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
}
function mondayMillis(key){
 const d=new Date(key+'T12:00:00Z');
 return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-((d.getUTCDay()+6)%7));
}
export function weekDatesFromOffset(offset=0,now=new Date()){
 const start=mondayMillis(localKey(now))+offset*7*86400000;
 return Array.from({length:7},(_,index)=>new Date(start+index*86400000).toISOString().slice(0,10));
}
export function weekOffsetForDate(key,now=new Date()){
 if(!isCalendarDateKey(key))return null;
 const delta=mondayMillis(key)-mondayMillis(localKey(now));
 return Math.round(delta/(7*86400000));
}
export function weekdayIndex(key){
 if(!isCalendarDateKey(key))return 0;
 return (new Date(key+'T12:00:00Z').getUTCDay()+6)%7;
}
export function isRegionalWeeklyEvent(event){return Boolean(event.zone);}
export function isUnconfirmedWeeklyEvent(event){
 return event.confirmation==='unconfirmed'||/unconfirmed|datamine|\btba\b/i.test([event.name,event.detail].filter(Boolean).join(' '));
}
export function weeklyEventLane(event){
 if(event.category==='max-battle-rotation'||/^Dynamax (Sableye|Machop|Espurr|Cryogonal)$/.test(event.name||''))return 'max';
 if(event.category==='raid'||(/raid|giratina|cresselia|darkrai|deoxys|mega |shadow incarnate/i.test(event.name||'')&&event.category!=='event'))return 'raids';
 return 'events';
}
export function weeklyEventCategory(event){
 const name=event.name||'';
 if(event.category==='raid')return 'Raid';
 if(event.category==='max-battle-rotation')return 'Max Battle';
 if(/spotlight hour/i.test(name))return 'Spotlight Hour';
 if(/community day/i.test(name))return 'Community Day';
 if(/max monday/i.test(name))return 'Max Monday';
 if(/raid/i.test(name)||weeklyEventLane(event)==='raids')return 'Raid';
 if(/max battle|gigantamax|dynamax/i.test(name)||weeklyEventLane(event)==='max')return 'Max Battle';
 return 'Event';
}
export function eventOnWeeklyDate(event,dateKey){
 return isCalendarDateKey(dateKey)&&isCalendarDateKey(event.start)&&isCalendarDateKey(event.end)&&event.start<=dateKey&&event.end>=dateKey;
}
export function filterWeeklyEvents(events,days,{category='all',area='all',confirmation='all'}={}){
 if(!Array.isArray(days)||days.length!==7)return [];
 return events.filter(event=>{
   if(!isCalendarDateKey(event.start)||!isCalendarDateKey(event.end))return false;
   if(event.start>days[6]||event.end<days[0])return false;
   if(category!=='all'&&weeklyEventCategory(event)!==category)return false;
   if(area==='global'&&isRegionalWeeklyEvent(event))return false;
   if(area==='regional'&&!isRegionalWeeklyEvent(event))return false;
   if(confirmation==='confirmed'&&isUnconfirmedWeeklyEvent(event))return false;
   if(confirmation==='unconfirmed'&&!isUnconfirmedWeeklyEvent(event))return false;
   return true;
 }).sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end)||(a.name||'').localeCompare(b.name||''));
}
