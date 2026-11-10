// Account-free, versioned saved-event state and standards-oriented .ics export.
// No localStorage access here: pure functions can be tested in Node and used in React.
import {isCalendarDateKey} from './weekly-calendar.mjs';

export const SAVED_EVENTS_KEY='alfamitsu:my-events:v1';
export const EVENT_PREFS_KEY='alfamitsu:event-preferences:v1';
export const REMINDERS=Object.freeze({
  none:'No reminder',PT10M:'10 minutes before',PT30M:'30 minutes before',
  PT1H:'1 hour before',P1D:'1 day before'
});
const recordFields=['id','name','start','end','startTime','endTime','zone','source'];
const validReminder=(value)=>Object.prototype.hasOwnProperty.call(REMINDERS,value);
const safeText=(value,max=600)=>typeof value==='string'?value.slice(0,max):'';
const safeId=(id)=>typeof id==='string'&&id.length>0&&id.length<=220&&!/[\r\n]/.test(id);

export function eventSnapshot(event){
 const snapshot={};
 for(const key of recordFields) snapshot[key]=safeText(event?.[key],key==='name'?300:600);
 return snapshot;
}
export function emptySavedCollection(){return {version:1,items:[]};}
export function normalizeSavedCollection(raw){
 let parsed=raw;
 if(typeof raw==='string'){
  if(raw.length>300000)return emptySavedCollection();
  try{parsed=JSON.parse(raw);}catch{return emptySavedCollection();}
 }
 if(!parsed||typeof parsed!=='object'||parsed.version!==1||!Array.isArray(parsed.items))return emptySavedCollection();
 const seen=new Set(),items=[];
 for(const entry of parsed.items){
  if(!entry||typeof entry!=='object'||!safeId(entry.id)||seen.has(entry.id))continue;
  seen.add(entry.id);
  const snapshot=eventSnapshot(entry.snapshot||{id:entry.id});
  snapshot.id=entry.id;
  items.push({id:entry.id,addedAt:safeText(entry.addedAt,40),
    reminder:validReminder(entry.reminder)?entry.reminder:'none',snapshot});
  if(items.length>=300)break;
 }
 return {version:1,items};
}
export function toggleSavedEvent(collection,event,now=''){
 const state=normalizeSavedCollection(collection);
 if(!safeId(event?.id))return state;
 const index=state.items.findIndex(item=>item.id===event.id);
 if(index>=0)return {...state,items:state.items.filter(item=>item.id!==event.id)};
 const added={id:event.id,addedAt:safeText(now,40),reminder:'none',snapshot:eventSnapshot(event)};
 return {...state,items:[...state.items.slice(-299),added]};
}
export function setSavedReminder(collection,id,reminder){
 const state=normalizeSavedCollection(collection);
 if(!validReminder(reminder))return state;
 return {...state,items:state.items.map(item=>item.id===id?{...item,reminder}:item)};
}
export function acknowledgeSavedEvent(collection,event){
 const state=normalizeSavedCollection(collection);
 if(!safeId(event?.id))return state;
 return {...state,items:state.items.map(item=>item.id===event.id?{...item,snapshot:eventSnapshot(event)}:item)};
}
export function savedEventChanges(record,current){
 if(!current)return ['Event is no longer in the website database'];
 if(!record?.snapshot)return [];
 const updated=eventSnapshot(current);
 const labels={
  name:'Event name updated',start:'Start date updated',end:'End date updated',
  startTime:'Start time updated',endTime:'End time updated',
  zone:'Event region or timezone updated',source:'Event source updated'
 };
 return Object.keys(labels).filter(key=>safeText(record.snapshot[key])!==updated[key]).map(key=>labels[key]);
}
export function serializeSavedCollection(collection){return JSON.stringify(normalizeSavedCollection(collection));}

function validZone(value){
 if(!value)return false;
 try{new Intl.DateTimeFormat('en-US',{timeZone:value});return true;}
 catch{return false;}
}
function datePlusOne(key){
 const date=new Date(key+'T12:00:00Z');
 date.setUTCDate(date.getUTCDate()+1);
 return date.toISOString().slice(0,10);
}
function dateStamp(key){return key.replaceAll('-','');}
function dateTimeStamp(key,time){return dateStamp(key)+'T'+time.replace(':','')+'00';}
function icalEscape(value){
 return safeText(value,1800).replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
}
function foldLine(input){
 // RFC 5545 limits content lines to 75 octets. Avoid breaking multibyte codepoints.
 const encoder=new TextEncoder();let bytes=0,line='',out='';
 for(const cp of input){
  const width=encoder.encode(cp).length;
  if(bytes+width>73){out+=line+'\r\n ';line='';bytes=1;}
  line+=cp;bytes+=width;
 }
 return out+line;
}
function formatEventLines(event,reminder,nowStamp){
 const rawId=safeText(event.id,220);
 const uid=encodeURIComponent(rawId).replace(/%/g,'-')+'@alfamitsu-services';
 const start=event.start,end=event.end;
 const specific=Boolean(event.startTime&&event.endTime&&/^\d\d:\d\d$/.test(event.startTime)&&/^\d\d:\d\d$/.test(event.endTime)&&!(event.startTime==='00:00'&&event.endTime==='23:59'));
 const zone=validZone(event.zone)?event.zone:null;
 const lines=['BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+nowStamp,'SUMMARY:'+icalEscape(event.name||'Pokémon GO Event')];
 if(specific){
  const endDate=end===start&&event.endTime<=event.startTime?datePlusOne(end):end;
  const prefix=zone?';TZID='+zone:'';
  lines.push('DTSTART'+prefix+':'+dateTimeStamp(start,event.startTime));
  lines.push('DTEND'+prefix+':'+dateTimeStamp(endDate,event.endTime));
 }else{
  lines.push('DTSTART;VALUE=DATE:'+dateStamp(start));
  lines.push('DTEND;VALUE=DATE:'+dateStamp(datePlusOne(end)));
 }
 const timing=zone?'Venue timezone: '+zone: 'Global/local event: confirm exact hours at the participating location.';
 const description=(event.detail||'')+'\n'+timing+(event.source?'\nSource: '+event.source:'');
 lines.push('DESCRIPTION:'+icalEscape(description.trim()));
 if(event.source&&/^https:\/\//i.test(event.source))lines.push('URL:'+safeText(event.source,600));
 if(/unconfirmed|datamine/i.test((event.name||'')+' '+(event.detail||'')))lines.push('STATUS:TENTATIVE');
 if(reminder!=='none'&&validReminder(reminder)){
  lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icalEscape('AlfaMitsu Services: '+event.name),'TRIGGER:-'+reminder,'END:VALARM');
 }
 lines.push('END:VEVENT');
 return lines;
}
export function buildCalendarExport(savedRecords,events,now=new Date()){
 const map=new Map(events.map(event=>[event.id,event]));
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AlfaMitsu Services//Pokemon GO My Events//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:AlfaMitsu Pokémon GO - My Events'];
 const date=now instanceof Date&&Number.isFinite(now.getTime())?now:new Date(0);
 const stamp=date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 let exported=0,skipped=0,alarms=0;
 const seen=new Set();
 for(const record of savedRecords){
  const event=map.get(record?.id);
  if(!event||seen.has(record.id)||!isCalendarDateKey(event.start)||!isCalendarDateKey(event.end)||event.end<event.start){skipped++;continue;}
  seen.add(record.id);
  const reminder=validReminder(record.reminder)?record.reminder:'none';
  lines.push(...formatEventLines(event,reminder,stamp));
  exported++;
  if(reminder!=='none')alarms++;
 }
 lines.push('END:VCALENDAR');
 return {content:lines.map(foldLine).join('\r\n')+'\r\n',eventCount:exported,skippedCount:skipped,reminderCount:alarms};
}
