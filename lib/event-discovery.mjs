// Phase 11: conservative discovery. Never infer event dates from headlines.
export const OFFICIAL_NEWS='https://pokemongo.com/news';
export function discoverLinks(html,base=OFFICIAL_NEWS){
 if(typeof html!=='string')return [];
 const links=new Map();
 const pattern=/<a\b([^>]*?)href=["']([^"'<>]+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
 for(const match of html.matchAll(pattern)){
  let u;try{u=new URL(match[2].replaceAll('&amp;','&'),base)}catch{continue}
  if(u.protocol!=='https:'||!['pokemongo.com','www.pokemongo.com'].includes(u.hostname)||!/^\/(?:en\/)?(?:news|post)\//.test(u.pathname))continue;
  u.hash='';u.search='';
  const title=match[4].replace(/<[^>]*>/g,' ').replace(/&(?:amp|nbsp);/g,' ').replace(/\s+/g,' ').trim().slice(0,180);
  if(title.length<8)continue;
  links.set(u.href,{url:u.href,title});
  if(links.size>=60)break;
 }
 return [...links.values()];
}
export function compareDiscovery(links,events){
 const sources=new Map();
 for(const e of events||[]){if(!e?.source)continue;try{const u=new URL(e.source);u.hash='';u.search='';sources.set(u.href,e)}catch{}}
 return links.map(item=>({...item,match:sources.has(item.url)?'existing-source':'review-new-source',eventId:sources.get(item.url)?.id||null}));
}
export function validateProposal(input,events){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid proposal');
 const allowed=['id','name','start','end','detail','source','zone','category','startTime','endTime','featuredPokemon'];
 if(Object.keys(input).some(k=>!allowed.includes(k)))throw Error('Unsupported fields');
 if(typeof input.id!=='string'||!/^[a-z0-9][a-z0-9-]{5,100}$/.test(input.id))throw Error('Invalid ID');
 if(typeof input.name!=='string'||input.name.trim().length<5||input.name.length>180)throw Error('Invalid name');
 if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(input.start||'')||!/^\\d{4}-\\d{2}-\\d{2}$/.test(input.end||'')||input.start>input.end)throw Error('Invalid date range');
 for(const k of ['start','end']){const d=new Date(input[k]+'T12:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==input[k])throw Error('Impossible date')}
 if(typeof input.source!=='string'||input.source.length>500)throw Error('Verified source required');
 const u=new URL(input.source);if(u.protocol!=='https:'||!['pokemongo.com','www.pokemongo.com'].includes(u.hostname))throw Error('Only official Pokémon GO source URLs are approved');
 if(input.detail!==undefined&&(typeof input.detail!=='string'||input.detail.length>1800))throw Error('Invalid detail');
 if(input.zone!==undefined&&(typeof input.zone!=='string'||input.zone.length>100))throw Error('Invalid zone');
 if(input.category!==undefined&&!['event','raid','max-battle-rotation'].includes(input.category))throw Error('Invalid category');
 for(const k of ['startTime','endTime'])if(input[k]!==undefined&&(typeof input[k]!=='string'||!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(input[k])))throw Error('Invalid time');
 if(input.featuredPokemon!==undefined&&(!Array.isArray(input.featuredPokemon)||input.featuredPokemon.length>20||input.featuredPokemon.some(x=>typeof x!=='string'||x.length>60)))throw Error('Invalid Pokémon list');
 const existing=(events||[]).find(e=>e.id===input.id);
 if(existing&&existing.source&&existing.source!==input.source)throw Error('Existing source differs; manual edit required');
 const collision=(events||[]).find(e=>e.id!==input.id&&e.name?.toLowerCase()===input.name.toLowerCase()&&e.start===input.start);
 if(collision)throw Error('Likely duplicate event');
 return {event:{...existing,...input,poster:existing?.poster||'/api/event-poster?id='+encodeURIComponent(input.id),posterType:existing?.posterType||'custom'},action:existing?'update':'add'};

}
