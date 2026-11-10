'use client';
import {useEffect,useMemo,useState} from 'react';
type Level='error'|'warning'|'info';
type Issue={id:string;severity:Level;code:string;eventId:string|null;eventName:string|null;field:string|null;message:string;suggestion:string};
type Report={summary:{events:number;posterMappings:number;localPosters:number;generatedPosters:number;errors:number;warnings:number;info:number};issues:Issue[];checkedAt:string;externalUrlsChecked:boolean};
type Decision='reviewed'|'needs-fix';
const STORAGE='alfamitsu:quality-review:v1';
const levelText:Record<Level,string>={error:'Blocking error',warning:'Needs review',info:'Informational'};
const colors:Record<Level,string>={error:'bg-rose-950/50 text-rose-200 border-rose-700',warning:'bg-amber-950/40 text-amber-200 border-amber-700',info:'bg-sky-950/40 text-sky-200 border-sky-700'};
function safeRead():Record<string,Decision>{
  try{
    const value=JSON.parse(window.localStorage.getItem(STORAGE)||'{}');
    if(!value || typeof value!=='object'||Array.isArray(value))return {};
    return Object.fromEntries(Object.entries(value).filter(([id,status])=>typeof id==='string'&&(status==='reviewed'||status==='needs-fix'))) as Record<string,Decision>;
  }catch{return {};}
}
export default function QualityDashboard(){
  const [report,setReport]=useState<Report|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [level,setLevel]=useState('all');
  const [review,setReview]=useState('all');
  const [decisions,setDecisions]=useState<Record<string,Decision>>({});
  useEffect(()=>{setDecisions(safeRead());void reload();},[]);
  async function reload(){
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/admin/quality',{cache:'no-store',credentials:'same-origin'});
      if(response.status===401){window.location.assign('/admin/login');return;}
      if(!response.ok)throw new Error('Unable to run the quality check.');
      setReport(await response.json());
    }catch(e){setError(e instanceof Error?e.message:'Unable to load quality results.');}
    finally{setLoading(false);}
  }
  function decide(id:string,status:Decision){
    setDecisions(previous=>{
      const next={...previous};
      if(next[id]===status)delete next[id];else next[id]=status;
      try{window.localStorage.setItem(STORAGE,JSON.stringify(next));}catch{}
      return next;
    });
  }
  const visible=useMemo(()=>{
    const needle=query.trim().toLowerCase();
    return (report?.issues||[]).filter(item=>
      (level==='all'||item.severity===level)&&
      (review==='all'||(review==='open'?!decisions[item.id]:decisions[item.id]===review))&&
      (!needle||[item.code,item.message,item.suggestion,item.eventId||'',item.eventName||''].some(x=>x.toLowerCase().includes(needle)))
    );
  },[report,query,level,review,decisions]);
  function downloadReport(){
    if(!report)return;
    const data={...report,reviewDecisions:decisions,notes:'Review decisions are stored on this browser only. Source edits and publication still take place through GitHub.'};
    const href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=href;link.download='alfamitsu-quality-review.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(href),1000);
  }
  async function logout(){
    try{await fetch('/api/admin/logout',{method:'POST',credentials:'same-origin'});}finally{window.location.assign('/admin/login');}
  }
  const total=report?.issues.length||0;
  const reviewed=report?.issues.filter(item=>decisions[item.id]==='reviewed').length||0;
  return <main className="min-h-screen bg-slate-950 px-4 py-7 text-slate-100 md:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-sky-900 pb-5">
        <div>
          <a href="/" className="text-sm text-sky-300 hover:underline">← AlfaMitsu Services homepage</a>
          <h1 className="mt-3 text-3xl font-bold">Owner quality dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Private checks for Pokémon GO event data, original poster references and image routing. Public website functionality is unaffected.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={loading} onClick={()=>void reload()} className="rounded-lg border border-sky-700 px-4 py-2 text-sm hover:bg-sky-900 disabled:opacity-60">Reload audit report</button>
          <button type="button" onClick={()=>void logout()} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">Sign out</button>
        </div>
      </header>

      {error&&<p role="alert" className="rounded-lg border border-rose-600 bg-rose-950/50 p-4 text-rose-100">{error}</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ['Events checked',report?.summary.events??'—'],
          ['Poster mappings',report?.summary.posterMappings??'—'],
          ['Blocking errors',report?.summary.errors??'—'],
          ['Warnings',report?.summary.warnings??'—'],
          ['Reviewed findings',String(reviewed)+' / '+String(total)]
        ].map(([label,value])=><div key={label} className="rounded-xl border border-sky-900 bg-slate-900 p-4">
          <p className="text-xs text-slate-300">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p>
        </div>)}
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
        <p>Last build-time audit: {report?.checkedAt?new Date(report.checkedAt).toLocaleString():'Not checked yet'} · The report is generated automatically for every deployment from repository data and local poster files. External webpages and image CDNs are not fetched, so links that later disappear still require manual verification.</p>
        <p className="mt-2">Mark findings reviewed or requiring fixes, then export the report for your GitHub update. Review decisions are saved in <strong>this browser only</strong>; they do not modify published event records or sync across devices.</p>
      </div>
      <section aria-label="Review findings" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Findings {loading?'(checking…)':'('+visible.length+')'}</h2>
          <button type="button" disabled={!report} onClick={downloadReport} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold hover:bg-sky-600 disabled:opacity-60">Export review JSON</button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">Search events or issue codes
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Event ID, Pokémon, field…" className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"/>
          </label>
          <label className="text-sm">Severity
            <select value={level} onChange={e=>setLevel(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"><option value="all">All severities</option><option value="error">Blocking errors</option><option value="warning">Warnings</option><option value="info">Informational</option></select>
          </label>
          <label className="text-sm">Review state
            <select value={review} onChange={e=>setReview(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"><option value="all">All findings</option><option value="open">Not reviewed</option><option value="needs-fix">Needs fix</option><option value="reviewed">Reviewed</option></select>
          </label>
        </div>
        {!loading&&visible.length===0&&<p className="rounded-xl border border-sky-900 p-8 text-center text-slate-300">No findings match these filters.</p>}
        {visible.slice(0,150).map(item=><article key={item.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <span className={'inline-block rounded-md border px-2 py-1 text-xs '+colors[item.severity]}>{levelText[item.severity]}</span>
              <p className="font-semibold">{item.code}</p>
              <p className="text-xs text-slate-400">{item.eventId?'Event '+item.eventId:'Global audit'}{item.eventName?' · '+item.eventName:''}{item.field?' · '+item.field:''}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={decisions[item.id]==='reviewed'} onClick={()=>decide(item.id,'reviewed')} className={'rounded-lg border px-3 py-2 text-xs '+(decisions[item.id]==='reviewed'?'border-emerald-500 bg-emerald-950 text-emerald-200':'border-slate-600 hover:bg-slate-800')}>✓ Reviewed</button>
              <button type="button" aria-pressed={decisions[item.id]==='needs-fix'} onClick={()=>decide(item.id,'needs-fix')} className={'rounded-lg border px-3 py-2 text-xs '+(decisions[item.id]==='needs-fix'?'border-amber-500 bg-amber-950 text-amber-200':'border-slate-600 hover:bg-slate-800')}>Flag for fix</button>
            </div>
          </div>
          <p className="mt-3 text-sm">{item.message}</p>
          <p className="mt-2 text-sm text-sky-200"><span className="font-semibold">Suggested fix:</span> {item.suggestion}</p>
        </article>)}
        {visible.length>150&&<p className="text-sm text-slate-400">Showing the first 150 of {visible.length} findings. Use filters or export the complete JSON report.</p>}
      </section>
      <footer className="border-t border-sky-900 py-5 text-sm text-slate-400">
        Source changes: <a target="_blank" rel="noopener noreferrer" href="https://github.com/AlfaMitsu/alfamitsu-pokemon-go-events/blob/main/lib/events.json" className="text-sky-300 underline">Event database on GitHub</a> · Original AlfaMitsu posters are preserved.
      </footer>
    </div>
  </main>;
}
