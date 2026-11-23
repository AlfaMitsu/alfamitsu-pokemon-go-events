export function orderEventsByStatus(events,today){
 const rank=e=>!/^\d{4}-\d{2}-\d{2}$/.test(e.start||'')?2:e.end<today?3:e.start>today?1:0;
 return [...events].sort((a,b)=>rank(a)-rank(b)||(rank(a)===3?b.end.localeCompare(a.end)||b.start.localeCompare(a.start):a.start.localeCompare(b.start)||a.end.localeCompare(b.end))||(a.name||'').localeCompare(b.name||''));
}
