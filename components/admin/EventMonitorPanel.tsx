'use client';
import {useState} from 'react';
type Report={checkedAt:string;day:string;events:number;current:number;upcoming:number;issues:{code:string;severity:string;eventId:string|null;message:string}[];remoteImages:{url:string;eventIds:string[]}[];remoteChecked:boolean;remote:{url:string;eventIds:string[];status:string;httpStatus:number|null;note:string}[]};
export default function EventMonitorPanel(){
 const [report,setReport]=useState<Report|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function run(remote:boolean){setBusy(true);setError('');try{const r=await fetch('/api/admin/monitor'+(remote?'?remote=1':''),{credentials:'same-origin',cache:'no-store'});if(r.status===401){window.location.assign('/admin/login');return}if(!r.ok)throw Error('Monitor unavailable');setReport(await r.json())}catch(e){setError(e instanceof Error?e.message:'Monitoring failed')}finally{setBusy(false)}}
 return <section aria-label="Phase 8 event monitoring" className="space-y-3 rounded-xl border border-sky-800 bg-slate-900/70 p-4">
 <h2 className="text-xl font-bold">Event-data monitoring</h2><p className="text-sm text-slate-300">Check future event coverage, missing source citations and remote poster health. Remote image requests are limited to approved hosts. Inconclusive responses are never labeled broken.</p>
 <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void run(false)} className="min-h-[44px] rounded-lg bg-sky-700 px-4 text-sm disabled:opacity-50">{busy?'Checking…':'Run freshness scan'}</button><button type="button" disabled={busy} onClick={()=>void run(true)} className="min-h-[44px] rounded-lg border border-sky-600 px-4 text-sm disabled:opacity-50">Scan freshness + remote posters</button></div>
 {error&&<p role="alert" className="text-rose-300">{error}</p>}
 {report&&<div className="space-y-3 text-sm"><p className="text-slate-300">Checked {new Date(report.checkedAt).toLocaleString()} · {report.events} records · {report.current} current/future · {report.upcoming} upcoming · {report.issues.length} findings · {report.remoteImages.length} approved remote image URLs</p>
 <div className="max-h-64 space-y-2 overflow-y-auto">{report.issues.slice(0,40).map((issue,i)=><p key={issue.code+issue.eventId+i} className="rounded border border-amber-900 p-2"><strong>{issue.code}</strong> · {issue.eventId||'Global'} · {issue.message}</p>)}{report.issues.length>40&&<p>Showing first 40 findings.</p>}</div>
 {report.remoteChecked&&<div className="space-y-2"><h3 className="font-semibold">Remote image results</h3>{report.remote.map(x=><p key={x.url} className="break-all rounded border border-slate-700 p-2"><strong>{x.status}</strong>{x.httpStatus?' · HTTP '+x.httpStatus:''} · {x.note} · {x.url}</p>)}</div>}
 </div>}
 </section>
}
