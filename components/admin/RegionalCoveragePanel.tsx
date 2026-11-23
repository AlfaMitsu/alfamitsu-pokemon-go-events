'use client';
import {useState} from 'react';
type Event={id:string;name:string;start:string;end:string;zone:string|null;source:string|null};
type Coverage={from:string;through:string;globalCount:number;regionalCount:number;regional:Event[];review:Event[];byZone:{zone:string;count:number}[]};
type Integrity={counts:Record<string,number>;findings:{id:string;kind:string;status:string}[]};
type Review={reviewCount:number;items:(Event&{issues:string[]})[]};
export default function RegionalCoveragePanel(){
 const [data,setData]=useState<Coverage|null>(null);
 const [integrity,setIntegrity]=useState<Integrity|null>(null);
 const [review,setReview]=useState<Review|null>(null);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[from,setFrom]=useState(''),[through,setThrough]=useState('');
 async function load(){
  setBusy(true);setError('');setData(null);setIntegrity(null);setReview(null);
  try{
   const qs=new URLSearchParams();if(from)qs.set('from',from);if(through)qs.set('through',through);
   const paths=['regional-coverage','regional-integrity','regional-review'];
   const responses=await Promise.all(paths.map(path=>fetch('/api/admin/'+path+'?'+qs.toString(),{credentials:'same-origin',cache:'no-store'})));
   if(responses.some(r=>r.status===401)){window.location.assign('/admin/login');return}
   const values=await Promise.all(responses.map(r=>r.json()));
   const bad=responses.findIndex(r=>!r.ok);if(bad>=0)throw Error(values[bad].error||'Regional review unavailable');
   setData(values[0] as Coverage);setIntegrity(values[1] as Integrity);setReview(values[2] as Review);
  }catch(e){setError(e instanceof Error?e.message:'Regional review unavailable')}finally{setBusy(false)}
 }
 function exportCsv(){
  if(!data)return;
  const csvCell=(v:string|null)=>'"'+String(v??'').replace(/"/g,'""').replace(/^[=+@\-\t\r]/,"'const csvCell=(v:string|null)=>'"'+String(v??'').replace(/"/g,'""').replace(/^\s*[=+@\-]/,"'const csvCell=(v:string|null)=>'"'+String(v??'').replace(/"/g,'""').replace(/^[=+@\-\t\r]/,"'$&")+'"';")+'"';
  const rows=")+'"';
  const rows=[['ID','Name','Start','End','Region','Source'].join(','),...data.regional.map(e=>[e.id,e.name,e.start,e.end,e.zone,e.source].map(csvCell).join(','))];
  const url=URL.createObjectURL(new Blob([rows.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='alfamitsu-regional-coverage.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <section className="space-y-3 rounded-xl border border-sky-800 bg-slate-900/70 p-4">
  <h2 className="text-xl font-bold">Phase 14 · Regional event review center</h2>
  <p className="text-sm text-slate-300">Review worldwide and location-exclusive event coverage, source provenance, invalid timezones and potential duplicates. This report never publishes or changes event data.</p>
  <div className="flex flex-wrap items-end gap-3">
   <label className="text-sm">From <input aria-label="Coverage start date" type="date" value={from} onChange={e=>setFrom(e.target.value)} className="block rounded border border-slate-600 bg-slate-950 p-2"/></label>
   <label className="text-sm">Through <input aria-label="Coverage end date" type="date" value={through} onChange={e=>setThrough(e.target.value)} className="block rounded border border-slate-600 bg-slate-950 p-2"/></label>
   <button type="button" onClick={()=>void load()} disabled={busy} className="min-h-[44px] rounded-lg bg-sky-700 px-4 text-sm disabled:opacity-50">{busy?'Checking…':'Run regional review'}</button>
   {data&&<button type="button" onClick={exportCsv} className="min-h-[44px] rounded-lg border border-sky-600 px-4 text-sm">Export regional CSV</button>}
  </div>
  {error&&<p role="alert" className="text-rose-300">{error}</p>}
  {data&&<div className="space-y-2 text-sm">
   <p className="font-semibold">{data.from} to {data.through} · {data.globalCount} global · {data.regionalCount} regional</p>
   <p>Regional zones: {data.byZone.map(x=>x.zone+' ('+x.count+')').join(', ')||'None recorded'}</p>
   <div className="max-h-60 space-y-2 overflow-y-auto">{data.regional.map(e=><p key={e.id} className="rounded border border-slate-700 p-2"><strong>{e.name}</strong> · {e.start}–{e.end} · {e.zone} {e.source&&<a href={e.source} target="_blank" rel="noopener noreferrer" className="text-sky-300 underline">Source</a>}</p>)}</div>
  </div>}
  {integrity&&<p className="text-sm text-slate-300">Sources: {integrity.counts.official||0} official-domain · {integrity.counts['third-party']||0} third-party · {integrity.counts.missing||0} missing · {integrity.counts.invalid||0} invalid. Domain classification does not verify claims.</p>}
  {review&&<div className="space-y-2 text-sm"><h3 className="font-bold">Owner review queue · {review.reviewCount} event records</h3><div className="max-h-60 space-y-2 overflow-y-auto">{review.items.map(e=><p key={e.id} className="rounded border border-amber-800 p-2"><strong>{e.name}</strong> · {e.zone||'Global'} · {e.issues.join('; ')}</p>)}</div>{review.reviewCount===0&&<p>No issues detected in published records for this range; this does not guarantee complete regional coverage.</p>}</div>}
 </section>;
}
