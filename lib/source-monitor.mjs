import {createHash} from 'node:crypto';
export function normalizeSource(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||!['pokemongo.com','www.pokemongo.com'].includes(u.hostname)||!/^\/(?:en\/)?(?:news|post)\//.test(u.pathname))return null;return 'https://pokemongo.com'+u.pathname.replace(/^\/en\//,'/').replace(/\/$/,'')}catch{return null}
}
export function articleFingerprint(html){
 if(typeof html!=='string')return null;
 const match=html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)||html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
 if(!match)return null;
 const body=match[1].replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim();
 if(body.length<200)return null;
 return createHash('sha256').update(body).digest('hex');
}
export function activeSources(events,today,limit=20){
 const map=new Map();
 for(const e of events){if(!e.end||e.end<today)continue;const url=normalizeSource(e.source);if(!url)continue;const group=map.get(url)||[];group.push(e.id);map.set(url,group)}
 return [...map].sort((a,b)=>a[0].localeCompare(b[0])).slice(0,limit).map(([url,ids])=>({url,ids}));
}
export function compareFingerprint(previous,current){
 if(!current)return 'unavailable';
 if(!previous)return 'baseline';
 return previous===current?'unchanged':'review-change';
}
