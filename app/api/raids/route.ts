import { NextResponse } from 'next/server';
export const revalidate=60;
type Boss={name:string;tier:string;id:number;counters:string[];category?:string;region?:string;availability?:string;availableUntil?:string;endDate?:string;image?:string;counterBasis?:string};
// Curated counters retained for already known bosses; any new species gets type-based examples.
const raidSnapshot:Boss[] = [
 {name:'Pikachu (Hat and Capelet)',tier:'1-Star',id:25,counters:['Groudon','Garchomp','Excadrill','Rhyperior'],availableUntil:'November 3, 2026 · 8:00 PM local time',endDate:'2026-11-03'},
 {name:'Sinistea (Bow)',tier:'1-Star',id:854,counters:['Darkrai','Hydreigon','Tyranitar','Gengar'],availableUntil:'November 3, 2026 · 8:00 PM local time',endDate:'2026-11-03'},
 {name:'Cofagrigus',tier:'3-Star',id:563,counters:['Darkrai','Hydreigon','Tyranitar','Gengar'],availableUntil:'November 3, 2026 · 8:00 PM local time',endDate:'2026-11-03'},
 {name:'Trevenant',tier:'3-Star',id:709,counters:['Reshiram','Darkrai','Mega Charizard Y','Hydreigon'],availableUntil:'November 3, 2026 · 8:00 PM local time',endDate:'2026-11-03'},
 {name:'Dhelmise',tier:'3-Star',id:781,counters:['Reshiram','Darkrai','Mega Charizard Y','Hydreigon'],availableUntil:'November 3, 2026 · 8:00 PM local time',endDate:'2026-11-03'},
 {name:'Giratina (Origin)',tier:'5-Star',id:487,counters:['Mega Rayquaza','Shadow Salamence','Shadow Tyranitar','Shadow Mamoswine'],availableUntil:'November 3, 2026 · 8:00 PM local time',endDate:'2026-11-03'},
 {name:'Mega Chandelure (Super Mega Raid Day)',tier:'Super Mega',category:'Mega',id:609,counters:['Primal Kyogre','Primal Groudon','Mega Gengar','Mega Tyranitar'],availability:'October 31, 2026 · 2:00–5:00 PM local time; rolling worldwide from New Zealand to Hawaii',availableUntil:'November 1, 2026 · 03:00 UTC (5:00 PM Hawaii); event ended',endDate:'2026-11-01'},
 {name:'Mega Sableye',tier:'Mega',id:302,counters:['Mega Gardevoir','Shadow Gardevoir','Xerneas','Primarina'],availableUntil:'November 8, 2026 · local time',endDate:'2026-11-08'},
 {name:'Shadow Gastly',tier:'Shadow 1-Star',id:92,counters:['Mewtwo','Darkrai','Groudon','Hydreigon'],availableUntil:'Not separately confirmed for this Shadow tier'},
 {name:'Shadow Totodile',tier:'Shadow 1-Star',id:158,counters:['Kartana','Zekrom','Roserade','Xurkitree'],availableUntil:'Not separately confirmed for this Shadow tier'},
 {name:'Shadow Shieldon',tier:'Shadow 1-Star',id:410,counters:['Lucario','Groudon','Kyogre','Lucario'],availableUntil:'Not separately confirmed for this Shadow tier'},
 {name:'Shadow Gible',tier:'Shadow 1-Star',id:443,counters:['Mamoswine','Gardevoir','Kyogre','Glaceon'],availableUntil:'Not separately confirmed for this Shadow tier'},
 {name:'Shadow Primeape',tier:'Shadow 3-Star',id:57,counters:['Mewtwo','Gardevoir','Rayquaza','Togekiss'],availableUntil:'Not separately confirmed for this Shadow tier'},
 {name:'Shadow Kirlia',tier:'Shadow 3-Star',id:281,counters:['Metagross','Gengar','Nihilego','Dialga'],availableUntil:'Not separately confirmed for this Shadow tier'},
 {name:'Shadow Drapion',tier:'Shadow 3-Star',id:452,counters:['Groudon','Garchomp','Excadrill','Landorus'],availableUntil:'Not separately confirmed for this Shadow tier'},
 {name:'Shadow Landorus (Incarnate)',tier:'Shadow 5-Star',id:645,counters:['Mamoswine','Kyogre','Glaceon','Weavile'],availableUntil:'November 3, 2026 · 10:00 PM local time',endDate:'2026-11-03'},
];

const regionExclusiveRaids:Boss[]=[
 {name:'Articuno — PokéPark KANTO',tier:'5-Star',category:'Legendary',id:144,region:'PokéPark KANTO, Yomiuriland, Tokyo, Japan',availability:'Oct 2026–Jan 2027 · during park hours · maximum one park raid per day',availableUntil:'January 2027 (exact final day not announced)',endDate:'2027-01-31',counters:['Mega Diancie','Rhyperior','Rampardos','Tyranitar'],},
 {name:'Excavator Pikachu — Fossil Museum',tier:'1-Star',category:'1 Star',id:25,region:'Field Museum, Chicago, Illinois, USA',availability:'May 22, 2026–Apr 11, 2027 · museum event hours',availableUntil:'April 11, 2027 · museum event hours',endDate:'2027-04-11',counters:['Groudon','Garchomp','Excadrill','Rhyperior'],},
 {name:'Astronaut Pikachu — ESA Museums',tier:'1-Star',category:'1 Star',id:25,region:'Science Museum (London); Cité de l’espace (Toulouse); Deutsches Museum (Nuremberg); Museu de les Ciències (València); Space Expo (Noordwijk); Euro Space Center (Transinne)',availability:'Oct 4, 2026–Apr 30, 2027 · participating museum hours · in-person raids',availableUntil:'April 30, 2027',endDate:'2027-04-30',counters:['Groudon','Garchomp','Excadrill','Rhyperior']},
 {name:'Mega Aerodactyl — Fossil Museum',tier:'Mega',category:'Mega',id:142,region:'Field Museum, Chicago, Illinois, USA',availability:'May 22, 2026–Apr 11, 2027 · museum event hours',availableUntil:'April 11, 2027 · museum event hours',endDate:'2027-04-11',counters:['Metagross','Kyogre','Zekrom','Rhyperior'],},
];
// Precise worldwide windows for locally scheduled Raid Days. Add future events here.
// NZ: Pacific/Auckland, Hawaii: Pacific/Honolulu; event clock hours are local.
const rollingRaidDays=[
 {match:/mega\s+chandelure/i,startUtc:'2026-10-31T01:00:00Z',endUtc:'2026-11-01T03:00:00Z',bossName:'Mega Chandelure (Super Mega Raid Day)'}
];
function withinGlobalEventWindow(name:string,now:number){
 const ev=rollingRaidDays.find(e=>e.match.test(name));
 return !ev || (now>=Date.parse(ev.startUtc) && now<Date.parse(ev.endUtc));
}
const feed='https://pokelitee.github.io/leak-duck/raid_bosses.json';
const order=['Mega Legendary','Gigantamax','Legendary','Mythical','Ultra Beasts','Mega','Shadows','3 Star','1 Star'];
const countersByType:Record<string,string[]>={normal:['Lucario','Machamp','Terrakion','Conkeldurr'],fire:['Kyogre','Groudon','Rhyperior','Swampert'],water:['Kartana','Zekrom','Xurkitree','Roserade'],grass:['Reshiram','Rayquaza','Mamoswine','Darmanitan'],electric:['Groudon','Garchomp','Excadrill','Landorus'],ice:['Metagross','Reshiram','Lucario','Terrakion'],fighting:['Mewtwo','Rayquaza','Gardevoir','Togekiss'],poison:['Groudon','Mewtwo','Garchomp','Excadrill'],ground:['Kyogre','Kartana','Mamoswine','Glaceon'],flying:['Rhyperior','Mamoswine','Zekrom','Rampardos'],psychic:['Darkrai','Hydreigon','Tyranitar','Gengar'],bug:['Reshiram','Rayquaza','Rhyperior','Rampardos'],rock:['Kyogre','Kartana','Lucario','Metagross'],ghost:['Darkrai','Hydreigon','Tyranitar','Gengar'],dragon:['Mamoswine','Gardevoir','Rayquaza','Dialga'],dark:['Lucario','Terrakion','Togekiss','Gardevoir'],steel:['Groudon','Reshiram','Lucario','Excadrill'],fairy:['Metagross','Nihilego','Dialga','Gengar']};
function category(t:string,shadow:boolean){const x=t.toLowerCase();if(shadow)return 'Shadows';if(x.includes('mega legendary')||x.includes('primal'))return 'Mega Legendary';if(x.includes('gigantamax'))return 'Gigantamax';if(x.includes('mega'))return 'Mega';if(x.includes('ultra'))return 'Ultra Beasts';if(x.includes('mythical'))return 'Mythical';if(/(^|[^0-9])5([^0-9]|$)/.test(x)||x.includes('legendary'))return 'Legendary';if(/(^|[^0-9])3([^0-9]|$)/.test(x))return '3 Star';return '1 Star'}
function normalize(root:unknown):Boss[]{if(!root||typeof root!=='object'||Array.isArray(root))throw Error('Invalid raid feed');const entries=Object.entries(root as Record<string,unknown>);const groups=entries.filter(([k,v])=>Array.isArray(v)&&(/tier|raid|mega|shadow|star/i.test(k)));if(!groups.length)throw Error('Unknown raid format');const out:Boss[]=[];for(const [group,items] of groups){for(const value of items as unknown[]){if(!value||typeof value!=='object')continue;const x=value as Record<string,unknown>;const raw=typeof x.name==='string'?x.name.trim():'';if(!raw||raw.length>100)continue;const shadow=x.is_shadow===true||/^shadow\s/i.test(raw)||/shadow/i.test(group);const name=shadow&&!/^shadow\s/i.test(raw)?'Shadow '+raw:raw;const tier=String(x.tier??group);const known=raidSnapshot.find(b=>b.name.toLowerCase()===name.toLowerCase());const types=Array.isArray(x.types)?x.types.filter(v=>typeof v==='string').map(v=>String(v).toLowerCase()):[];const counterSet=types.length?countersByType[types[0]]:undefined;const derived=known?.counters?.length?known.counters:(counterSet||[]);const idCandidate=x.pokemon_id??x.dex_number??x.id;const id=typeof idCandidate==='number'&&Number.isInteger(idCandidate)&&idCandidate>0?idCandidate:known?.id||0;const asset=typeof x.asset_url==='string'&&x.asset_url.startsWith('https://')?x.asset_url:undefined;out.push({name,tier:shadow?'Shadow '+tier:tier,id,category:category(group+' '+tier,shadow),counters:derived.slice(0,4),counterBasis:known?'Previously curated':'Type-based examples (not ranked)',image:asset})}}if(!out.length)throw Error('Empty raid feed');return Array.from(new Map(out.map(b=>[b.name.toLowerCase(),b])).values())}
function localDate(z:string){const parts=new Intl.DateTimeFormat('en-US',{timeZone:z,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=(k:string)=>parts.find(p=>p.type===k)?.value||'';return `${v('year')}-${v('month')}-${v('day')}`}
export async function GET(){
 const now=Date.now();
 const today=localDate('Pacific/Honolulu');
 const regional=regionExclusiveRaids.filter(b=>!b.endDate||today<=b.endDate).map(b=>({...b,counterBasis:'Previously curated'}));
 let bosses:Boss[]=[];
 let status='live-feed';
 let notice='Raid results refresh approximately every minute. Limited-time Raid Days use a New Zealand-to-Hawaii worldwide availability window; each individual raid is still only available during the announced local event hours. Counter suggestions are not verified rankings.';
 try{
  const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),9000);let r:Response;
  try{r=await fetch(feed,{next:{revalidate:60},signal:ctl.signal})}finally{clearTimeout(timer)}
  if(!r.ok)throw Error('Feed unavailable');
  bosses=normalize(await r.json());
 }catch{
  const todayUtc=localDate('UTC');
  if(todayUtc>='2026-10-28'&&todayUtc<='2026-11-03'){
   bosses=raidSnapshot.filter(b=>(!b.endDate||todayUtc<=b.endDate)&&(!b.name.startsWith('Shadow ')||['2026-10-31','2026-11-01'].includes(todayUtc)));
   status='verified-schedule-fallback';
   notice='Community feed unavailable. Using the dated October 28–November 3 rotation, filtered by exact Raid Day worldwide windows; regional raids remain separate.';
  }else{
   status='feed-unavailable';
   notice='Community feed unavailable and no current verified global snapshot; expired global bosses are hidden.';
  }
 }
 // Filter special Raid Days even if the feed is late or incorrectly keeps the boss listed.
 bosses=bosses.filter(b=>withinGlobalEventWindow(b.name,now));
 // Include curated Raid Day boss if its verified worldwide window is open and feed omitted it.
 for(const ev of rollingRaidDays){
  if(now>=Date.parse(ev.startUtc)&&now<Date.parse(ev.endUtc)&&!bosses.some(b=>ev.match.test(b.name))){
   const special=raidSnapshot.find(b=>b.name===ev.bossName);
   if(special)bosses.push({...special,counterBasis:'Previously curated'});
  }
 }
 // A partial community feed must not hide verified featured 5-star/Mega raids.
 // Keep known featured bosses through their scheduled worldwide end date.
 const worldwideDate=localDate('Pacific/Honolulu');
 const featured=['Giratina (Origin)','Mega Sableye'];
 for(const name of featured){
  const curated=raidSnapshot.find(b=>b.name===name);
  if(!curated||worldwideDate<'2026-10-28'||(curated.endDate&&worldwideDate>curated.endDate))continue;
  const existing=bosses.findIndex(b=>b.name.toLowerCase().replace(/forme?/g,'').replace(/[^a-z]/g,'')===name.toLowerCase().replace(/forme?/g,'').replace(/[^a-z]/g,''));
  if(existing>=0){bosses[existing]={...bosses[existing],...curated,category:category(curated.tier,false),counterBasis:'Verified featured rotation'};}
  else bosses.push({...curated,category:category(curated.tier,false),counterBasis:'Verified featured rotation'});
 }
 // Correct categories and rank shadow bosses by difficulty, 5-star first.
 const shadowTier=(b:Boss)=>Number(b.tier.match(/[135](?=\D|$)/)?.[0]||0);
 const result=[...bosses,...regional].sort((a,b)=>{
  const ai=order.indexOf(a.category||''),bi=order.indexOf(b.category||'');
  if(ai!==bi)return ai-bi;
  if(a.category==='Shadows'&&b.category==='Shadows')return shadowTier(b)-shadowTier(a)||a.name.localeCompare(b.name);
  return a.name.localeCompare(b.name);
 });
 return NextResponse.json({bosses:result,status,source:'Community Leek Duck mirror + verified time-limited event windows',updatedAt:new Date(now).toISOString(),notice,sourceUrl:feed},{headers:{'Cache-Control':'public, s-maxage=60, stale-while-revalidate=30'}});
}
