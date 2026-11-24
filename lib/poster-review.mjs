export function posterReview(events,mapping,assets=[]){
 const assigned=new Map(), known=new Set(assets), rows=[];
 const norm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 for(const e of events){
 const src=e.poster||mapping[e.id]||'';
 const kind=src.startsWith('/posters/')?'local':src.startsWith('/api/event-poster')?'generated':/^https:\/\//.test(src)?'external':'missing';
 const flags=[];
 if(kind==='missing')flags.push('missing artwork');
 if(kind==='generated')flags.push('generated fallback');
 if(e.poster&&mapping[e.id]&&e.poster!==mapping[e.id])flags.push('mapping differs');
 if(kind==='local'&&assets.length&&!known.has(src))flags.push('missing local file');
 const candidates=assets.filter(p=>p!==src&&[norm(e.id),norm(e.name)].some(n=>n.length>=8&&norm(p.split('/').pop().replace(/\.[^.]+$/,'')).includes(n))).slice(0,5);
 if(candidates.length)flags.push('possible alternate artwork');
 if(src&&kind!=='generated'){const ids=assigned.get(src)||[];ids.push(e.id);assigned.set(src,ids)}
 rows.push({id:e.id,name:e.name,start:e.start,end:e.end,src,kind,flags,candidates});
 }
 for(const row of rows)if((assigned.get(row.src)||[]).length>1)row.flags.push('shared artwork — review');
 return {rows,summary:{total:rows.length,local:rows.filter(r=>r.kind==='local').length,generated:rows.filter(r=>r.kind==='generated').length,external:rows.filter(r=>r.kind==='external').length,missing:rows.filter(r=>r.kind==='missing').length,review:rows.filter(r=>r.flags.length).length}};
}
