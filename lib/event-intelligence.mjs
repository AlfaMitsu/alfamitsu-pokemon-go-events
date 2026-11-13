// Pure Phase 6 event intelligence helpers. Do not infer exact times for date-only events.
export const EVENT_INTELLIGENCE_PREFS='alfamitsu:event-intelligence:v1';
export const isDated=e=>/^\d{4}-\d{2}-\d{2}$/.test(e?.start||'')&&/^\d{4}-\d{2}-\d{2}$/.test(e?.end||'');
export const eventStart=(e)=>isDated(e)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.startTime||'')?e.start+'T'+e.startTime+':00':null;
export const eventEnd=(e)=>isDated(e)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.endTime||'')?e.end+'T'+e.endTime+':00':null;
export function eventState(e,today){if(!isDated(e))return 'TBA';if(e.end<today)return 'Ended';if(e.start>today)return 'Upcoming';return 'Ongoing'}
export function countdownDays(e,today){if(!isDated(e)||e.start<=today)return null;const d=Math.round((Date.parse(e.start+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000);return d>=0?d:null}
export function filterIntelligence(events,{area='all',category='all',query='',includeEnded=false}={},today){return events.filter(e=>(includeEnded||eventState(e,today)!=='Ended')&&(area==='all'||(area==='regional'?Boolean(e.zone):!e.zone))&&(category==='all'||(e.category||'event')===category)&&[e.name,e.detail,e.zone,...(e.featuredPokemon||[])].filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>(a.start||'9999').localeCompare(b.start||'9999')||a.name.localeCompare(b.name))}
export function overlappingEvents(events){const ordered=events.filter(isDated).sort((a,b)=>a.start.localeCompare(b.start));const pairs=[];for(let i=0;i<ordered.length;i++)for(let j=i+1;j<ordered.length&&ordered[j].start<=ordered[i].end;j++)if(ordered[i].id!==ordered[j].id)pairs.push([ordered[i],ordered[j]]);return pairs}
export function weeklyDigest(events,today){const end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+7);const through=end.toISOString().slice(0,10);return events.filter(e=>isDated(e)&&e.start<=through&&e.end>=today).sort((a,b)=>a.start.localeCompare(b.start))}
