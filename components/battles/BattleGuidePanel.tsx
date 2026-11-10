'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {BookOpen,CalendarDays,ChevronDown,ExternalLink,RefreshCw,Shield,ShieldPlus,Swords,Zap,AlertTriangle,Plus,Trash2} from 'lucide-react';
import {GO_TYPES,GO_WEATHER_TYPES,goTypeMatchups,matchupForMove,maxMoveCost,coverageCandidates} from '@/lib/go-battle-guides.mjs';
type Mode='raid'|'max';
type Boss={name:string;id:number;tier:string;category?:string;region?:string;availability?:string;availableUntil?:string;endDate?:string;counterBasis?:string;counters:string[]};
type Roster={bosses:Boss[];status:string;updatedAt:string|null;notice:string;source:string};
type MaxSchedule={name:string;start:string;end:string;featuredPokemon?:string[];source?:string;category?:string};
type Profile={requested:string;resolved:string;types:string[];scope:string;formVerified:boolean;typeSource:string;notice:string;noGoMovesets:boolean};
type TeamMember={id:number;name:string;types:string[];eligible:boolean;role:'attacker'|'guard'|'spirit';verified:boolean};
const label=(value:string)=>value.replace(/(^|[- ])\w/g,char=>char.toUpperCase());
const typeStyles=(multiplier:number)=>multiplier>1?'border-emerald-600/70 bg-emerald-950/30 text-emerald-200':multiplier<1?'border-rose-800/60 bg-rose-950/20 text-rose-200':'border-sky-800 bg-[#071930] text-sky-200';
const reading=(date:string)=>new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
function safeDate(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value);}
const sourceGuide='https://www.pokebattler.com/raids/guides';
const sourceMechanics='https://pokemongo.com/en/max-pokemon-battle';
const sourceCosts='https://db.pokemongohub.net/items/max-particles';
const sourceTypes='https://www.poketools.com/pokemon-go-type-chart';
const plainButton='min-h-[44px] rounded-lg border border-sky-700 bg-[#0a2950] px-3 py-2 text-sm text-sky-100 hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300';
const formInput='min-h-[44px] w-full rounded-lg border border-sky-700 bg-[#06162e] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500';
const formLabel='block space-y-1 text-xs font-semibold text-sky-200';
function spriteSrc(name:string){return '/api/pokemon-image?name='+encodeURIComponent(name);}
function asMaxChoices(events:MaxSchedule[]){
 const now=new Date();const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const list=events.filter(e=>e.end>=date&&e.start&&e.end&&(e.category==='max-battle-rotation'||/max monday|gigantamax|dynamax/i.test(e.name)));
 const options:listItem[]=[];const seen=new Set<string>();
 for(const event of list.sort((a,b)=>a.start.localeCompare(b.start))){
  for(const raw of event.featuredPokemon||[]){
   const name=raw.trim();
   if(!name||seen.has(name.toLowerCase()))continue;
   seen.add(name.toLowerCase());options.push({name,event});
  }
 }
 return options.slice(0,48);
}
type listItem={name:string;event:MaxSchedule};
export default function BattleGuidePanel({initialMode='raid',initialBoss='',onOpenCalculator,maxEvents}:{initialMode?:Mode;initialBoss?:string;onOpenCalculator:(mode:Mode)=>void;maxEvents:MaxSchedule[]}){
 const [mode,setMode]=useState<Mode>(initialMode);
 const [raidData,setRaidData]=useState<Roster>({bosses:[],status:'loading',updatedAt:null,notice:'',source:''});
 const [bossName,setBossName]=useState(initialBoss);
 const [customName,setCustomName]=useState('');
 const [typing,setTyping]=useState<string[]>([]);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [typeStatus,setTypeStatus]=useState<'idle'|'loading'|'verified'|'manual'|'unavailable'>('idle');
 const [typeMessage,setTypeMessage]=useState('');
 const [weather,setWeather]=useState<keyof typeof GO_WEATHER_TYPES>('none');
 const [sameType,setSameType]=useState(true);
 const [teamInput,setTeamInput]=useState('');
 const [teamBusy,setTeamBusy]=useState(false);
 const [teamMessage,setTeamMessage]=useState('');
 const [team,setTeam]=useState<TeamMember[]>([]);
 const [move,setMove]=useState<'attack'|'guard'|'spirit'>('attack');
 const [fromLevel,setFromLevel]=useState(1);
 const [toLevel,setToLevel]=useState(3);
 const [candyGroup,setCandyGroup]=useState<'A'|'B'|'C'|'D'>('A');
 const nextMember=useRef(1);
 const maxChoices=useMemo(()=>asMaxChoices(maxEvents),[maxEvents]);
 const raidBoss=raidData.bosses.find(b=>b.name===bossName);
 const maxChoice=maxChoices.find(item=>item.name===bossName);
 const selectedSource=mode==='max'?maxChoice?.event.source:undefined;
 const maxSpecial=/eternat|zacian|zamazenta/i.test(bossName);
 const bossCandidates=mode==='raid'?raidData.bosses.map(b=>b.name):maxChoices.map(x=>x.name);
 const allCandidates=useMemo(()=>[...new Set([...(bossName?[bossName]:[]),...bossCandidates])],[bossName,bossCandidates]);
 useEffect(()=>{
  let active=true;
  const read=async()=>{
   try{
    const response=await fetch('/api/raids',{cache:'no-store'});
    if(!response.ok)throw Error('raid roster not reachable');
    const data:Roster=await response.json();
    if(!active)return;
    setRaidData(data);
    if(mode==='raid')setBossName(old=>old||data.bosses?.[0]?.name||'');
   }catch{
    if(active)setRaidData({bosses:[],status:'unavailable',updatedAt:null,notice:'Raid roster unavailable. Use manual species entry and check the raid source.',source:''});
   }
  };void read();return()=>{active=false};
 },[]);
 useEffect(()=>{
  if(mode==='max'&&!bossName&&maxChoices.length)setBossName(maxChoices[0].name);
 },[mode,bossName,maxChoices]);
 useEffect(()=>{
  let active=true;
  if(!bossName.trim()){setTyping([]);setProfile(null);setTypeStatus('idle');return;}
  setTyping([]);setProfile(null);setTypeStatus('loading');setTypeMessage('');
  const run=async()=>{
   try{
    const response=await fetch('/api/battle-profile?name='+encodeURIComponent(bossName),{cache:'force-cache'});
    const data=await response.json();
    if(!active)return;
    if(!response.ok||!Array.isArray(data.types)||!data.types.length)throw Error(data.error||'Species type source unavailable');
    setTyping(data.types);
    setProfile(data);
    setTypeStatus('verified');
   }catch(error){
    if(active){setTypeStatus('unavailable');setTypeMessage(error instanceof Error?error.message:'Unknown typing');}
   }
  };void run();return()=>{active=false};
 },[bossName]);
 const types=typing.filter(type=>GO_TYPES.includes(type as typeof GO_TYPES[number]));
 const matchups=types.length?goTypeMatchups(types):[];
 const strong=matchups.filter(x=>x.multiplier>1.001);
 const weak=matchups.filter(x=>x.multiplier<0.999);
 const teamRanked=useMemo(()=>coverageCandidates(team,types),[team,types]);
 const cost=maxMoveCost(move,fromLevel,toLevel,{group:candyGroup});
 const isCurrentRaid=mode==='raid'&&raidBoss;
 const maxEligible=team.filter(x=>x.eligible).length;
 const teamLimit=mode==='raid'?6:3;
 const selectMode=(next:Mode)=>{
  if(next===mode)return;
  setMode(next);setTeamMessage('');
  setBossName(next==='raid'?raidData.bosses[0]?.name||'':maxChoices[0]?.name||'');
 };
 async function addTeamMember(){
  const name=teamInput.trim();
  if(!name){setTeamMessage('Enter a Pokémon name to inspect.');return;}
  if(name.length>90||!/^[-a-z0-9 ().:'é’]+$/i.test(name)){setTeamMessage('Enter a valid Pokémon name (90 characters maximum).');return;}
  if(team.length>=teamLimit){setTeamMessage('This planning lineup is full; remove an entry to add another.');return;}
  setTeamBusy(true);setTeamMessage('');
  let species:string[]=[];let verified=false;
  try{
   const response=await fetch('/api/battle-profile?name='+encodeURIComponent(name),{cache:'force-cache'});
   if(response.ok){const data=await response.json();species=Array.isArray(data.types)?data.types:[];verified=species.length>0;}
  }catch{}
  const member:TeamMember={id:nextMember.current++,name,types:species,eligible:mode==='raid',role:'attacker',verified};
  setTeam(old=>[...old,member].slice(0,teamLimit));
  setTeamInput('');
  if(!verified)setTeamMessage('Added without verified typing. Check spelling or the Pokémon form before using matchup advice.');
  setTeamBusy(false);
 }
 const sourceText='Coverage uses Pokémon type alone. Actual performance requires legal Pokémon GO moves, Attack/Defense stats, level, IVs, weather, boss moveset, friendship, Party Power, dodging and a current simulation.';
 return <div className="space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-cyan-300"><BookOpen size={24}/><span className="text-xs font-bold uppercase tracking-[.2em]">AlfaMitsu Battle Research</span></div><h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Advanced Battle Guides</h2><p className="mt-1 max-w-3xl text-sm text-sky-200">Pokémon GO raid and Max Battle preparation with source-linked typing, honest counter confidence, and direct access to your existing calculators.</p></div><a className={plainButton} href={sourceGuide} target="_blank" rel="noopener noreferrer">Published raid simulations <ExternalLink size={14} className="ml-1 inline"/></a></div>
  <div role="tablist" aria-label="Guide mode" className="grid grid-cols-2 gap-2 rounded-xl border border-sky-800 bg-[#071a39] p-1.5">
   <button role="tab" aria-selected={mode==='raid'} type="button" onClick={()=>selectMode('raid')} className={`min-h-[48px] rounded-lg px-3 text-sm font-bold ${mode==='raid'?'bg-blue-700 text-white':'text-sky-200 hover:bg-sky-800'}`}>⚔️ Raid guide</button>
   <button role="tab" aria-selected={mode==='max'} type="button" onClick={()=>selectMode('max')} className={`min-h-[48px] rounded-lg px-3 text-sm font-bold ${mode==='max'?'bg-blue-700 text-white':'text-sky-200 hover:bg-sky-800'}`}>⚡ Max Battle guide</button>
  </div>
  <section className="space-y-4 rounded-2xl border border-sky-700 bg-[#092146] p-4">
   <h3 className="flex items-center gap-2 text-lg font-bold"><Swords size={20}/> Battle boss profile</h3>
   <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <label className={formLabel}>{mode==='raid'?'Choose from the current raid roster':'Choose a listed Max encounter'}
     <select className={formInput} value={bossName} onChange={e=>setBossName(e.target.value)} aria-label="Choose a raid or Max boss">
      {!allCandidates.length?<option value="">No listed bosses yet</option>:allCandidates.map(name=><option value={name} key={name}>{name}</option>)}
     </select>
    </label>
    <form onSubmit={e=>{e.preventDefault();const name=customName.trim();if(name){setBossName(name);setCustomName('');}}} className="space-y-1">
     <label htmlFor="custom-guide-species" className="block text-xs font-semibold text-sky-200">Or inspect a Pokémon species/form</label>
     <div className="flex min-w-0 gap-2"><input id="custom-guide-species" value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="e.g., Rayquaza" maxLength={100} className={formInput}/><button type="submit" className="min-h-[44px] rounded-lg bg-blue-700 px-3 text-sm font-bold hover:bg-blue-600">Inspect</button></div>
    </form>
   </div>
   {bossName&&<div className="flex flex-wrap gap-3 rounded-xl border border-sky-800 bg-[#06182f] p-3">
    <img alt={bossName} src={spriteSrc(bossName)} className="h-24 w-24 shrink-0 rounded-lg bg-sky-900/30 object-contain"/>
    <div className="min-w-0 flex-1 space-y-1"><h4 className="break-words text-xl font-bold">{bossName}</h4>
     {raidBoss&&<p className="text-xs text-sky-200">{raidBoss.tier}{raidBoss.region?' · Region-exclusive: '+raidBoss.region:''}</p>}
     {raidBoss?.availableUntil&&<p className="text-xs text-amber-200">Source availability: {raidBoss.availableUntil}</p>}
     {maxChoice&&<p className="text-xs text-sky-200">{reading(maxChoice.event.start)} – {reading(maxChoice.event.end)} · {maxChoice.event.name}</p>}
     <div className="flex flex-wrap gap-2">{types.map(type=><span key={type} className="rounded-full border border-cyan-600/70 bg-[#114776] px-3 py-1 text-xs font-bold">{label(type)}</span>)}</div>
     <p className="text-xs text-slate-300">{typeStatus==='loading'?'Checking typing…':typeStatus==='verified'?profile?.formVerified?'Exact form typing found in reference data.':'Species typing found; GO moveset not verified.':typeStatus==='unavailable'?'Exact type data unavailable. Select types manually below.':'Choose a Pokémon to begin.'}</p>
    </div>
   </div>}
   <div className="grid gap-3 sm:grid-cols-2">
    {[0,1].map(index=><label className={formLabel} key={index}>{index===0?'Defending type 1':'Defending type 2 (optional)'}
     <select className={formInput} value={typing[index]||''} onChange={e=>{setTyping(old=>{const next=[old[0]||'',old[1]||''];next[index]=e.target.value;return [...new Set(next.filter(Boolean))]});setTypeStatus('manual')}} aria-label={index===0?'Boss type 1':'Boss type 2'}>
      <option value="">No type selected</option>{GO_TYPES.map(type=><option key={type} value={type}>{label(type)}</option>)}
     </select>
    </label>)}
   </div>
   {typeStatus==='manual'&&<p className="text-xs text-amber-200"><AlertTriangle size={14} className="mr-1 inline"/> Manual type override — confirm the exact GO form before using the matchup results.</p>}
   {typeMessage&&<p className="text-xs text-amber-200">{typeMessage}</p>}
   {mode==='raid'?<div className="rounded-lg border border-sky-800 bg-[#06182f] p-3 text-xs text-sky-200">
    <p><strong>Raid roster:</strong> {raidData.status} · {raidData.updatedAt||'No timestamp'} · {raidData.source||'External feed'}</p>
    {raidData.notice&&<p className="mt-1 text-amber-200">{raidData.notice}</p>}
    <a className="mt-2 inline-block text-cyan-200 underline" href="https://leekduck.com/boss/" target="_blank" rel="noopener noreferrer">Cross-check the current raid listing <ExternalLink size={12} className="inline"/></a>
   </div>:<div className="rounded-lg border border-sky-800 bg-[#06182f] p-3 text-xs text-sky-200">
    <p>Encounter names and date windows come from AlfaMitsu's existing event archive. Check official event rules before assuming the boss is in your region or available now.</p>
    {selectedSource&&<a className="mt-1 inline-block text-cyan-200 underline" href={selectedSource} target="_blank" rel="noopener noreferrer">Open event announcement <ExternalLink size={12} className="inline"/></a>}
   </div>}
  </section>
  <section className="space-y-3 rounded-2xl border border-sky-700 bg-[#081d3c] p-4">
   <h3 className="text-lg font-bold">Type strengths & resistances</h3>
   <p className="text-xs text-sky-300">Pokémon GO uses 1.6× for a super-effective single type, 0.625× for resistance, and approximately 0.391× for main-series immunity. Multipliers combine across two defending types.</p>
   {matchups.length?<div className="grid gap-4 lg:grid-cols-2">
    <div><h4 className="mb-2 text-sm font-semibold text-emerald-200">Recommended attack types (typing only)</h4>{strong.length?<div className="flex flex-wrap gap-2">{strong.map(x=><span key={x.type} className={`rounded-full border px-3 py-2 text-sm font-bold ${typeStyles(x.multiplier)}`}>{label(x.type)} · {x.multiplier}×</span>)}</div>:<p className="text-sm text-sky-300">No super-effective attack type for this typing.</p>}</div>
    <div><h4 className="mb-2 text-sm font-semibold text-rose-200">Resisted attack types</h4>{weak.length?<div className="flex flex-wrap gap-2">{weak.map(x=><span key={x.type} className={`rounded-full border px-3 py-2 text-sm ${typeStyles(x.multiplier)}`}>{label(x.type)} · {x.multiplier}×</span>)}</div>:<p className="text-sm text-sky-300">No resisted attack types.</p>}</div>
   </div>:<p className="text-sm text-amber-200">Verified or manually selected typing is required for matchup guidance.</p>}
   <div className="grid gap-3 border-t border-sky-800 pt-3 sm:grid-cols-3">
    <label className={formLabel}>Weather scenario
     <select className={formInput} value={weather} onChange={e=>setWeather(e.target.value as keyof typeof GO_WEATHER_TYPES)}>{Object.keys(GO_WEATHER_TYPES).map(key=><option key={key} value={key}>{key==='none'?'No weather boost':label(key.replace('-',' '))}</option>)}</select>
    </label>
    <label className="flex items-center gap-2 self-end rounded-lg border border-sky-800 px-3 py-3 text-sm text-sky-100"><input type="checkbox" checked={sameType} onChange={e=>setSameType(e.target.checked)}/> Assume same-type move (STAB)</label>
    <div className="self-end rounded-lg border border-sky-800 bg-[#06172f] p-3 text-xs text-sky-200">Weather and STAB only modify an actual move of the matching type. These multipliers are <strong>not</strong> a DPS forecast.</div>
   </div>
   {strong.length>0&&<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{strong.slice(0,6).map(item=><div key={item.type} className="rounded-lg border border-emerald-900 bg-emerald-950/15 p-3 text-xs"><span className="font-bold text-cyan-100">{label(item.type)} move</span><div className="mt-1 font-bold text-emerald-200">{matchupForMove(item.type,types,{sameType,weather})}×</div><p className="mt-1 text-sky-300">With selected weather/STAB assumptions</p></div>)}</div>}
   <a href={sourceTypes} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-cyan-200 underline">Pokémon GO type chart reference <ExternalLink size={12} className="inline"/></a>
  </section>
  {mode==='raid'&&<section className="space-y-3 rounded-2xl border border-sky-700 bg-[#081d3c] p-4">
   <h3 className="text-lg font-bold">Raid counter reference</h3>
   {isCurrentRaid&&raidBoss.counters.length?<><p className="text-xs text-amber-200">These are existing roster example counters, not a current simulation ranking. Movesets, trainer count and survival are not independently verified by this guide.{raidBoss.counterBasis?' Data note: '+raidBoss.counterBasis:''}</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[...new Set(raidBoss.counters)].slice(0,6).map(name=><div key={name} className="rounded-lg border border-sky-800 bg-[#05162d] p-2 text-center"><img loading="lazy" src={spriteSrc(name)} alt={name} className="mx-auto h-20 w-20 object-contain"/><p className="mt-2 text-xs font-semibold">{name}</p></div>)}</div>
   </>:<p className="text-sm text-sky-300">There are no current feed counter examples for this selected boss. Use the type matchups above and verify move-specific simulations.</p>}
   <p className="text-xs text-sky-300">Simulation results vary with boss Fast/Charged moves, raid tier, attacker level, IVs, dodging, friendship, weather, Party Power and Mega/Primal effects. This guide does not claim a verified min-trainer estimate.</p>
   <a href={sourceGuide} target="_blank" rel="noopener noreferrer" className={plainButton+' inline-flex items-center gap-2'}>See verified per-boss raid simulations <ExternalLink size={14}/></a>
  </section>}
  <section className="space-y-4 rounded-2xl border border-sky-700 bg-[#081d3c] p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold">{mode==='raid'?'Personal raid lineup (up to 6)':'Personal Max lineup (up to 3)'}</h3><span className="rounded-full border border-sky-700 px-3 py-1 text-xs text-sky-200">{team.length} / {teamLimit}</span></div>
   <p className="text-xs text-amber-200">{mode==='max'?'Only eligible Max Battle Pokémon can be selected for most Max Battles; mark eligibility only after confirming it in your game. Teams have up to three Pokémon. Gigantamax G-Max attack types may differ from Fast Attack types.':'Pokémon type coverage can suggest candidates, but a matching legal Pokémon GO move and the boss moveset must be verified before choosing a raid team.'}</p>
   <form onSubmit={e=>{e.preventDefault();void addTeamMember()}} className="flex flex-wrap gap-2">
    <label className="min-w-[200px] flex-1 space-y-1 text-xs font-semibold text-sky-200">Your Pokémon species/form
     <input type="text" value={teamInput} onChange={e=>setTeamInput(e.target.value)} placeholder="e.g., Excadrill" maxLength={90} className={formInput}/>
    </label>
    <button disabled={teamBusy||team.length>=teamLimit} type="submit" className="flex min-h-[44px] items-center gap-2 self-end rounded-lg bg-blue-700 px-4 text-sm font-bold hover:bg-blue-600 disabled:opacity-50"><Plus size={16}/>{teamBusy?'Checking…':'Add to lineup'}</button>
   </form>
   {teamMessage&&<p role="status" className="text-xs text-amber-200">{teamMessage}</p>}
   {team.length?<div className="grid gap-3 lg:grid-cols-2">{teamRanked.slice(0,teamLimit).map((member,index)=>{
    const possible=member.possibleTypeCoverage;
    return <article key={member.id} className="flex min-w-0 items-start gap-3 rounded-xl border border-sky-800 bg-[#051831] p-3">
     <img src={spriteSrc(member.name)} alt={member.name} className="h-16 w-16 shrink-0 rounded-lg bg-sky-900/30 object-contain"/>
     <div className="min-w-0 flex-1 space-y-1">
      <div className="flex items-start justify-between gap-2"><p className="break-words text-sm font-bold">{index+1}. {member.name}</p><button type="button" aria-label={'Remove '+member.name} onClick={()=>setTeam(old=>old.filter(x=>x.id!==member.id))} className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-md border border-sky-800 text-rose-200 hover:bg-rose-950"><Trash2 size={15}/></button></div>
      <p className="text-xs text-sky-200">{member.verified?member.types.map(label).join(' / '):'Typing not verified'} · {possible===null?'Coverage unknown':possible+'× potential type coverage'}</p>
      {mode==='max'&&<div className="space-y-2 pt-2">
       <label className="flex items-center gap-2 text-xs text-amber-100"><input type="checkbox" checked={member.eligible} onChange={e=>setTeam(old=>old.map(x=>x.id===member.id?{...x,eligible:e.target.checked}:x))}/> I confirmed Max Battle eligibility</label>
       <label className="block space-y-1 text-xs text-sky-200">Planned role
        <select value={member.role} onChange={e=>setTeam(old=>old.map(x=>x.id===member.id?{...x,role:e.target.value as TeamMember['role']}:x))} className={formInput}>
         <option value="attacker">Max Attack / G-Max Attack</option><option value="guard">Tank / Max Guard</option><option value="spirit">Support / Max Spirit</option>
        </select>
       </label>
      </div>}
     </div>
    </article>
   })}</div>:<p className="rounded-lg border border-sky-900 p-4 text-sm text-sky-300">Add Pokémon you own to compare possible attack-type coverage for the selected boss. No GO login or collection access is required.</p>}
   {mode==='max'&&team.length>0&&<p className="text-xs text-amber-200">{maxEligible} of {team.length} entries have user-confirmed Max eligibility. A group of four players can each bring up to three suitable Pokémon. Choose Guard/Spirit support where the encounter requires it.</p>}
   <p className="text-xs text-sky-300">{sourceText}</p>
  </section>
  {mode==='max'&&<section className="space-y-4 rounded-2xl border border-sky-700 bg-[#081d3c] p-4">
   <h3 className="flex items-center gap-2 text-lg font-bold"><Zap size={20}/> Max Battle mechanics & upgrades</h3>
   <div className="grid gap-3 md:grid-cols-3">
    <div className="rounded-xl border border-sky-800 bg-[#06182f] p-3"><Swords size={22} className="text-amber-300"/><p className="mt-2 text-sm font-bold">Max Attack</p><p className="mt-1 text-xs text-sky-300">Ordinary Dynamax attack type follows the Pokémon's Fast Attack. Gigantamax uses a species-specific G-Max Move that may differ.</p></div>
    <div className="rounded-xl border border-sky-800 bg-[#06182f] p-3"><Shield size={22} className="text-blue-300"/><p className="mt-2 text-sm font-bold">Max Guard</p><p className="mt-1 text-xs text-sky-300">Reduces incoming damage. Consider a tank with Guard for coordinated groups.</p></div>
    <div className="rounded-xl border border-sky-800 bg-[#06182f] p-3"><ShieldPlus size={22} className="text-emerald-300"/><p className="mt-2 text-sm font-bold">Max Spirit</p><p className="mt-1 text-xs text-sky-300">Heals your Pokémon and allies. A support role can improve team survival.</p></div>
   </div>
   <p className="text-xs text-sky-300">Max Battles use a three-turn Max phase. Particles are spent only after winning. Standard Gigantamax encounters can involve up to 40 Trainers arranged in groups of four or fewer. Event-specific exceptions require checking the event announcement.</p>
   {maxSpecial&&<p className="rounded-lg border border-amber-600/50 bg-amber-950/20 p-3 text-xs text-amber-200"><AlertTriangle className="mr-1 inline" size={14}/> This encounter includes an exceptional Max mechanic or cost group. Do not apply the standard Candy group calculator blindly. For Eternatus and special Crowned forms, consult the in-game move costs and the dedicated existing Eternatus tool.</p>}
   <h4 className="border-t border-sky-800 pt-4 text-sm font-bold">Standard Max Move upgrade preview</h4>
   <p className="text-xs text-amber-200">The Candy group must be identified for your specific species. This is an editable <strong>standard</strong> example, not a species-assigned quotation. Special Pokémon may have different costs.</p>
   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <label className={formLabel}>Move<select className={formInput} value={move} onChange={e=>{const selected=e.target.value as 'attack'|'guard'|'spirit';setMove(selected);setFromLevel(selected==='attack'?1:0)}}>
      <option value="attack">Max Attack</option><option value="guard">Max Guard</option><option value="spirit">Max Spirit</option>
    </select></label>
    <label className={formLabel}>Current level<select className={formInput} value={fromLevel} onChange={e=>setFromLevel(Number(e.target.value))}>{(move==='attack'?[1,2]:[0,1,2]).map(level=><option key={level} value={level}>{level===0?'Locked':String(level)}</option>)}</select></label>
    <label className={formLabel}>Target level<select className={formInput} value={toLevel} onChange={e=>setToLevel(Number(e.target.value))}>{[1,2,3].map(level=><option key={level} value={level}>Level {level}</option>)}</select></label>
    <label className={formLabel}>Species Candy cost group<select className={formInput} value={candyGroup} onChange={e=>setCandyGroup(e.target.value as 'A'|'B'|'C'|'D')}>{(['A','B','C','D'] as const).map(group=><option value={group} key={group}>Group {group}</option>)}</select></label>
   </div>
   {cost?<div className="grid gap-3 sm:grid-cols-3">
    {[['Max Particles',cost.mp],['Candy',cost.candy],['Candy XL',cost.candyXL]].map(([unit,value])=><div key={unit} className="rounded-xl border border-sky-800 bg-[#07152d] p-4 text-center"><p className="text-2xl font-black text-cyan-200">{Number(value).toLocaleString()}</p><p className="mt-1 text-xs text-sky-200">{unit}</p></div>)}
   </div>:<p className="rounded-lg border border-amber-700/60 p-3 text-sm text-amber-200">Target level must be above the current level. Max Attack starts unlocked at level 1.</p>}
   <div className="flex flex-wrap gap-2"><a href={sourceMechanics} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-200 underline">Official Max Battle mechanics <ExternalLink size={12} className="inline"/></a><a href={sourceCosts} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-200 underline">Particle and upgrade cost reference <ExternalLink size={12} className="inline"/></a></div>
  </section>}
  <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-700/50 bg-gradient-to-r from-[#0b3058] to-[#091d43] p-4">
   <div><h3 className="font-bold">{mode==='raid'?'Continue to your existing Raid Planner':'Continue to your existing Max Battle Calculator'}</h3><p className="mt-1 text-xs text-sky-200">All existing event filters, budget calculations, Eternatus planner and reference tools remain available.</p></div>
   <button type="button" onClick={()=>onOpenCalculator(mode)} className="min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500">{mode==='raid'?'Open Raid Planner':'Open Max Battle Calculator'} →</button>
  </section>
 </div>;
}
