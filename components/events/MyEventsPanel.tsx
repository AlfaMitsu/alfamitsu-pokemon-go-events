'use client';
import {useMemo,useRef,useState} from 'react';
import {Bookmark,CalendarDays,Download,Upload,Bell,CheckCircle2,AlertTriangle,Clock3,Search,CalendarPlus} from 'lucide-react';
import {buildCalendarExport,REMINDERS,savedEventChanges,serializeSavedCollection} from '@/lib/my-events.mjs';
import type {SavedCollection,SavedEventRecord,CalendarEvent} from '@/lib/my-events.mjs';

type EventView=CalendarEvent & {category?:string;featuredPokemon?:string[];poster?:string;posterType?:string;};
type Props<T extends EventView>={
 events:T[];
 collection:SavedCollection;
 loaded:boolean;
 onOpen:(event:T)=>void;
 onRemove:(id:string)=>void;
 onReminder:(id:string,value:SavedEventRecord['reminder'])=>void;
 onAcknowledge:(event:T)=>void;
 onImport:(raw:string)=>void;
 statusOf:(event:T)=>string;
 displayTime:(event:T)=>string;
 imageFor:(event:T)=>string|undefined;
};
function downloadText(contents:string,filename:string,mime:string){
 const url=URL.createObjectURL(new Blob([contents],{type:mime}));
 const link=document.createElement('a');
 link.href=url;link.download=filename;link.style.display='none';
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function humanDate(key:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return 'Date to be confirmed';
 return new Date(key+'T12:00:00Z').toLocaleDateString('en-US',{dateStyle:'medium',timeZone:'UTC'});
}
export default function MyEventsPanel<T extends EventView>({events,collection,loaded,onOpen,onRemove,onReminder,onAcknowledge,onImport,statusOf,displayTime,imageFor}:Props<T>){
 const [search,setSearch]=useState('');
 const [statusFilter,setStatusFilter]=useState('upcoming');
 const [areaFilter,setAreaFilter]=useState('all');
 const [message,setMessage]=useState('');
 const upload=useRef<HTMLInputElement>(null);
 const map=useMemo(()=>new Map(events.map(e=>[e.id,e])),[events]);
 const entries=useMemo(()=>collection.items.map(record=>({record,event:map.get(record.id)})).sort((a,b)=>{
  if(!a.event)return 1;if(!b.event)return -1;
  return a.event.start.localeCompare(b.event.start)||a.event.name.localeCompare(b.event.name);
 }),[collection,map]);
 const visible=entries.filter(({record,event})=>{
  if(!event)return statusFilter==='all'&&record.snapshot.name.toLowerCase().includes(search.toLowerCase());
  const status=statusOf(event);
  if(statusFilter==='upcoming'&&status!=='Upcoming'&&status!=='Ongoing')return false;
  if(statusFilter==='completed'&&status!=='Completed')return false;
  if(areaFilter==='regional'&&!event.zone)return false;
  if(areaFilter==='global'&&event.zone)return false;
  const haystack=[event.name,event.detail,...(event.featuredPokemon||[]),event.zone].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(search.trim().toLowerCase());
 });
 const changedCount=entries.filter(({record,event})=>savedEventChanges(record,event).length>0).length;
 function exportCalendar(records:SavedEventRecord[]){
  const result=buildCalendarExport(records,events);
  if(!result.eventCount){setMessage('No scheduled events can be exported. Events without confirmed dates are skipped.');return;}
  downloadText(result.content,'alfamitsu-my-events.ics','text/calendar;charset=utf-8');
  setMessage('Exported '+result.eventCount+' event(s) with '+result.reminderCount+' reminder alarm(s).'+(result.skippedCount?' Skipped '+result.skippedCount+' unavailable/undated record(s).':''));
 }
 async function importBackup(file?:File){
  if(!file)return;
  if(file.size>300000){setMessage('Backup exceeds the 300 KB limit.');return;}
  try{
   const raw=await file.text();
   const parsed=JSON.parse(raw);
   if(parsed?.version!==1||!Array.isArray(parsed.items))throw new Error('Unsupported backup format.');
   if(!window.confirm('Replace saved events and reminder settings on this browser with this backup?'))return;
   onImport(raw);setMessage('Saved events imported to this browser.');
  }catch{setMessage('Import failed. Choose an AlfaMitsu My Events JSON backup.');}
  finally{if(upload.current)upload.current.value='';}
 }
 const count=collection.items.length;
 return <div className="space-y-5">
  <header className="space-y-2">
   <div className="flex items-center gap-3"><Bookmark className="text-cyan-300" size={30}/><h1 className="text-3xl font-black tracking-tight">My Events</h1></div>
   <p className="text-sm text-sky-200">Save Pokémon GO events, organize upcoming plans, and export reminders to your calendar. No account required.</p>
  </header>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
   {([['Saved events',loaded?count:'…'],['Schedule updates',loaded?changedCount:'…'],['Reminders set',loaded?collection.items.filter(x=>x.reminder!=='none').length:'…']] as const).map(([label,value])=>
    <div key={label} className="rounded-xl border border-sky-800 bg-[#0a2449] p-4"><p className="text-xs font-semibold text-sky-300">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p></div>
   )}
  </div>
  <div className="space-y-3 rounded-xl border border-sky-700 bg-[#071c3e] p-4">
   <p className="flex items-center gap-2 text-sm font-bold text-cyan-100"><CalendarDays size={18}/> Calendar and backup</p>
   <div className="flex flex-wrap gap-2">
    <button type="button" disabled={!loaded||count===0} onClick={()=>exportCalendar(collection.items)} className="flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"><CalendarPlus size={16}/> Export all to calendar (.ics)</button>
    <button type="button" disabled={!loaded||!visible.length} onClick={()=>exportCalendar(visible.map(x=>x.record))} className="flex min-h-[44px] items-center gap-2 rounded-lg border border-sky-600 px-4 py-2 text-sm hover:bg-sky-800 disabled:opacity-50"><Download size={16}/> Export visible events</button>
    <button type="button" disabled={!loaded||count===0} onClick={()=>{downloadText(serializeSavedCollection(collection),'alfamitsu-my-events-backup.json','application/json');setMessage('Saved a JSON backup.');}} className="flex min-h-[44px] items-center gap-2 rounded-lg border border-sky-700 px-4 py-2 text-sm hover:bg-sky-800 disabled:opacity-50"><Download size={16}/> Backup bookmarks</button>
    <button type="button" onClick={()=>upload.current?.click()} className="flex min-h-[44px] items-center gap-2 rounded-lg border border-sky-700 px-4 py-2 text-sm hover:bg-sky-800"><Upload size={16}/> Restore backup</button>
    <input ref={upload} type="file" accept=".json,application/json" aria-label="Select My Events JSON backup" onChange={e=>void importBackup(e.target.files?.[0])} className="hidden"/>
   </div>
   <p className="text-xs leading-relaxed text-sky-300"><Bell size={13} className="mr-1 inline"/> Reminders are embedded in exported .ics calendar entries and depend on your calendar application's alert settings. This site does not send background push notifications. Global events without a verified venue timezone use your calendar's local time; verify the event source.</p>
   {message&&<p role="status" className="text-sm text-cyan-200">{message}</p>}
  </div>
  <section className="space-y-3">
   <div className="grid gap-3 rounded-xl border border-sky-800 bg-[#0a2449] p-3 sm:grid-cols-3">
    <label className="space-y-1 text-xs font-semibold text-sky-200">Search saved events
     <span className="relative block"><Search className="absolute left-3 top-3 text-sky-300" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pokémon, event or region" className="min-h-[44px] w-full min-w-0 rounded-lg border border-sky-700 bg-[#06172e] py-2 pl-10 pr-2 text-sm text-white"/></span>
    </label>
    <label className="space-y-1 text-xs font-semibold text-sky-200">Status
     <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-sky-700 bg-[#06172e] px-3 text-sm text-white"><option value="upcoming">Upcoming and ongoing</option><option value="all">All saved events</option><option value="completed">Completed</option></select>
    </label>
    <label className="space-y-1 text-xs font-semibold text-sky-200">Region
     <select value={areaFilter} onChange={e=>setAreaFilter(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-sky-700 bg-[#06172e] px-3 text-sm text-white"><option value="all">All locations</option><option value="global">Global</option><option value="regional">Regional/exclusive</option></select>
    </label>
   </div>
   {!loaded?<p className="rounded-xl border border-sky-900 p-5 text-sm text-sky-300">Loading saved events…</p>:count===0?<div className="rounded-2xl border border-sky-800 bg-[#071a38] p-8 text-center"><Bookmark className="mx-auto text-cyan-300" size={36}/><h2 className="mt-3 text-xl font-bold">No saved events yet</h2><p className="mt-2 text-sm text-sky-300">Use the bookmark controls in GO Weekly, Events List, or Event Details to start planning.</p></div>:visible.length===0?<p className="rounded-xl border border-sky-900 p-5 text-sm text-sky-300">No saved events match these filters. Try “All saved events” to view completed events or items needing review.</p>:<div className="grid items-start gap-3 lg:grid-cols-2">{visible.map(({record,event})=>{
    const changes=savedEventChanges(record,event);
    const existing=Boolean(event);
    return <article key={record.id} className="min-w-0 space-y-3 rounded-2xl border border-sky-800 bg-[#071c3c] p-4">
     <div className="flex min-w-0 gap-3">
      {event&&imageFor(event)?<img alt={event.name+' poster'} loading="lazy" src={imageFor(event)} className="h-24 w-20 shrink-0 rounded-lg border border-sky-700 bg-[#16335d] object-cover" onError={e=>{e.currentTarget.style.display='none';}}/>:<div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-sky-900/50"><CalendarDays size={28}/></div>}
      <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase text-cyan-300">{event?statusOf(event):'Not found in current database'}</p><h3 className="mt-1 break-words font-bold text-white">{event?.name||record.snapshot.name||record.id}</h3><p className="mt-1 text-xs text-sky-200">{event?humanDate(event.start)+(event.end!==event.start?' – '+humanDate(event.end):''):'Saved event may have been archived or removed'}</p><p className="mt-1 text-xs text-sky-300">{event?.zone?'Regional / location-specific':'Global / location not specified'}</p></div>
     </div>
     {changes.length>0&&<div className="rounded-lg border border-amber-600/60 bg-amber-950/30 p-3 text-sm"><p className="flex items-center gap-2 font-semibold text-amber-200"><AlertTriangle size={15}/> Schedule or record changed</p><p className="mt-1 text-xs text-amber-100">{changes.join(' · ')}</p>{event&&<button type="button" onClick={()=>onAcknowledge(event)} className="mt-2 flex min-h-[36px] items-center gap-1 rounded-md border border-amber-500/60 px-2 py-1 text-xs font-semibold text-amber-100 hover:bg-amber-900/30"><CheckCircle2 size={14}/> Mark update reviewed</button>}</div>}
     {event&&<p className="text-xs leading-relaxed text-sky-200"><Clock3 size={13} className="mr-1 inline"/>{displayTime(event)}</p>}
     <label className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-sky-200">Reminder before event start
      <select value={record.reminder} onChange={e=>onReminder(record.id,e.target.value as SavedEventRecord['reminder'])} className="min-h-[44px] min-w-[160px] rounded-lg border border-sky-600 bg-[#07152f] px-2 text-sm text-white">
       {Object.entries(REMINDERS).map(([value,label])=><option key={value} value={value}>{label}</option>)}
      </select>
     </label>
     <div className="flex flex-wrap gap-2">
      {event&&<button type="button" onClick={()=>onOpen(event)} className="min-h-[44px] rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold hover:bg-blue-600">Event details</button>}
      {event&&<button type="button" onClick={()=>exportCalendar([record])} className="flex min-h-[44px] items-center gap-1 rounded-lg border border-sky-600 px-3 py-2 text-sm text-sky-100 hover:bg-sky-800"><CalendarPlus size={15}/> Add to calendar</button>}
      <button type="button" onClick={()=>onRemove(record.id)} className="min-h-[44px] rounded-lg border border-rose-700/70 px-3 py-2 text-sm text-rose-200 hover:bg-rose-950/40">Remove bookmark</button>
     </div>
    </article>;
   })}</div>}
  </section>
  <p className="text-xs leading-relaxed text-sky-400">Your bookmarks, review markers and reminder preferences are stored only on this browser/device. Clearing site data removes them unless you exported a backup. They are not shared with AlfaMitsu Services or automatically synchronized.</p>
 </div>;
}
