"use client";
import React,{useEffect,useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';import {Card} from '@/components/ui/card';import {Input} from '@/components/ui/input';
import {CalendarDays,Swords,Zap,Coins,Dna,Skull,BarChart3,Menu,Search,ChevronLeft,ChevronRight,RefreshCw,ExternalLink} from 'lucide-react';
import eventsJson from '@/lib/events.json';import postersJson from '@/lib/posters.json';import {sprite,fmt,coinEstimate,rankIV,rocket} from '@/lib/game';
type Event={id:string;start:string;end:string;name:string;detail?:string;zone?:string;startTime?:string;endTime?:string};type Raid={name:string;tier:string;id:number;counters:string[];category?:string;region?:string;availability?:string;availableUntil?:string;endDate?:string;image?:string;counterBasis?:string};
const events=eventsJson as Event[];const posterMap=postersJson as Record<string,string>;
function poster(e:Event){let t=e.name.toLowerCase();if(t.includes('halloween part 2'))return posterMap.halloween2;if(t.includes('halloween part 1'))return posterMap.halloween1;if(t.includes('giratina origin'))return posterMap['giratina-origin'];if(t.includes('mega sableye'))return posterMap['mega-sableye'];if(t.includes('gastly'))return posterMap.gastly;if(t.includes('morelull'))return posterMap.morelull;if(t.includes('dynamax trails'))return posterMap['dynamax-trails'];if(t.includes('fc seoul'))return posterMap['fc-seoul'];if(t.includes('pokémon center bangkok'))return posterMap.bangkok;if(t.includes('night out'))return posterMap['night-la'];if(t.includes('day of the dead')||t.includes('muertos'))return posterMap['day-dead'];if(t.includes('mall explorations'))return posterMap.mall;if(t.includes('max battle day'))return posterMap['max-day'];return undefined}
const tba=(e:Event)=>/tba|unannounced|to be announced/i.test(e.name)||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(e.start);const evSort=(a:Event,b:Event)=>Number(tba(a))-Number(tba(b))||a.start.localeCompare(b.start);const nice=(s:string)=>new Date(s+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
function PokemonPic({name,small=false,shadow=false}:{name:string;small?:boolean;shadow?:boolean}){const [failed,setFailed]=useState(false);const clean=name.replace(/^Shadow\s+/i,'').trim();const shadowed=shadow||/^Shadow\s+/i.test(name);return <div className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center ${shadowed?'border-violet-500 bg-violet-950/20 shadowtile':'border-sky-900 bg-slate-950/30'}`}>{failed?<div className={`${small?'smallmon':'monpic'} ${shadowed?'shadowmon':''} grid place-items-center text-sky-300 text-xl`} aria-label="No Pokémon sprite available">◉</div>:<img className={`${small?'smallmon':'monpic'} ${shadowed?'shadowmon':''}`} src={'/api/pokemon-image?name='+encodeURIComponent(clean)} loading="lazy" alt={name} onError={()=>setFailed(true)}/>}<span className={`text-xs ${shadowed?'shadowlabel':''}`}>{name}</span></div>}
function RaidBossPic({name,id,shadow=false}:{name:string;id:number;shadow?:boolean}){const clean=name.replace(/—.*$/,'').replace(/^Shadow\s+/i,'').trim();const fallback=sprite(id);const primary='/api/pokemon-image?name='+encodeURIComponent(clean);const [src,setSrc]=useState(primary);const [failed,setFailed]=useState(false);const shadowed=shadow||/^Shadow\s+/i.test(name);if(failed)return <div className={`h-16 w-16 shrink-0 rounded-lg border ${shadowed?'border-violet-500 bg-violet-950/20':'border-sky-800 bg-slate-950/30'} grid place-items-center text-sky-300 ${shadowed?'shadowmon':''}`}>◉</div>;return <img src={src} alt={name} className={`h-16 w-16 shrink-0 object-contain ${shadowed?'shadowmon':''}`} onError={()=>{if(src!==fallback){setSrc(fallback)}else{setFailed(true)}}}/> }
function NumberField({label,value,set,min=0,max=999999,step=1}:{label:string;value:number;set:(v:number)=>void;min?:number;max?:number;step?:number}){return <label className="field">{label}<Input type="number" min={min} max={max} step={step} value={Number.isNaN(value)?"":value} onChange={e=>set(e.target.value===""?NaN:Number(e.target.value))}/></label>}
function Select({label,value,set,options}:{label:string;value:string;set:(v:string)=>void;options:{value:string;label:string}[]}){return <label className="field">{label}<select className="select" value={value} onChange={e=>set(e.target.value)}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>}
function Metrics({items}:{items:[string,string|number][]}){return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map(([k,v])=><div className="stat" key={k}><strong>{v}</strong><span>{k}</span></div>)}</div>}
const RAID_CATEGORIES=['Mega Legendary','Gigantamax','Legendary','Mythical','Ultra Beasts','Mega','Shadows','3 Star','1 Star'] as const;
function RaidTool(){
 const [data,setData]=useState<{bosses:Raid[];status:string;updatedAt:string|null;notice:string;source:string}>({bosses:[],status:'loading',updatedAt:null,notice:'',source:''});
 const [selected,setSelected]=useState('');
 const load=async()=>{try{const r=await fetch('/api/raids',{cache:'no-store'});if(!r.ok)throw Error('Raid endpoint unavailable');const j=await r.json();setData(j);setSelected(p=>j.bosses.some((x:Raid)=>x.name===p)?p:j.bosses[0]?.name||'')}catch{setData({bosses:[],status:'error',updatedAt:null,notice:'Unable to verify the raid roster. Check the current external listing.',source:''});setSelected('')}};
 useEffect(()=>{load();const id=setInterval(load,30*60*1000);return()=>clearInterval(id)},[]);
 const boss=data.bosses.find(x=>x.name===selected);
 return <Card className="space-y-4">
  <div className="flex justify-between gap-3"><h2 className="text-xl font-bold">⚔️ Raid Planner</h2><Button variant="outline" onClick={load}><RefreshCw size={15} className="mr-2"/> Refresh</Button></div>
  <p className="muted text-sm">Raid categories follow your preferred order. Suggested counter pictures appear beside every raid boss. Location-exclusive raids appear in their normal raid tiers. Ordinary Dynamax encounters remain in the Max Battle tool. Raid bosses update from an external community feed, usually within about an hour. Updates can lag and should be verified for time-sensitive rotations.</p>
  <div className="text-xs text-sky-200">{data.source} · {data.updatedAt||'Not verified'} · {data.status}</div><p className="text-xs text-amber-200">{data.notice}</p>
  <a className="text-sm underline" target="_blank" rel="noreferrer" href="https://leekduck.com/boss/">View current raid roster on Leek Duck</a>
  {RAID_CATEGORIES.map(cat=>{const bosses=data.bosses.filter(x=>x.category===cat);return <section key={cat} className="space-y-2"><h3 className="text-base font-semibold border-b border-sky-900 pb-1">{cat} <span className="text-xs muted">({bosses.length})</span></h3>{bosses.length?<div className="grid gap-3 xl:grid-cols-2">{bosses.map(x=>{const shadow=/^Shadow\s+/i.test(x.name)||x.category==='Shadows';return <div key={x.name} className={`rounded-xl border p-3 ${shadow?'shadowcard':'border-sky-800 bg-slate-950/30'}`}><div className="flex items-center gap-3">{x.image?<img src={x.image} alt={x.name} className={`h-16 w-16 shrink-0 object-contain ${shadow?'shadowmon':''}`}/>:<RaidBossPic name={x.name} id={x.id} shadow={shadow}/>}<div className="min-w-0"><div className={`font-semibold text-sm ${shadow?'shadowlabel':''}`}>{x.name}</div><div className="text-xs muted">{x.tier}</div>{x.region&&<div className="text-xs text-amber-200">📍 {x.region}</div>}{x.availability&&<div className="text-xs text-sky-300">{x.availability}</div>}{x.availableUntil&&<div className="text-xs font-semibold text-amber-200">Available until: {x.availableUntil}</div>}</div></div><div className="mt-3"><p className="text-xs font-semibold text-sky-200 mb-2">Suggested counters {x.counterBasis&&<span className="font-normal text-sky-300">· {x.counterBasis}</span>}</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{x.counters.map(n=><PokemonPic key={n} name={n} small/>)}</div>{!x.counters.length&&<p className="text-xs text-amber-200">No counter examples available for this boss yet.</p>}</div></div>})}</div>:<p className="text-xs muted">No verified raid currently listed in this category.</p>}</section>})}

  
 </Card>;
}
function MaxTool(){const [kind,setKind]=useState('800');const [battles,setBattles]=useState(5);const [owned,setOwned]=useState(0);const [packMP,setPackMP]=useState(800);const [packCoins,setPackCoins]=useState(150);const [move,setMove]=useState('attack');const [from,setFrom]=useState('1');const [to,setTo]=useState('3');const [monCount,setMonCount]=useState(1);const battleMP=Math.max(0,Number(kind)*(battles||0));const moveCosts=move==='attack'?{'0-1':0,'1-2':600,'2-3':800}:{'0-1':400,'1-2':600,'2-3':800};let moveMP=0;for(let i=Number(from);i<Number(to);i++)moveMP+=moveCosts[`${i}-${i+1}` as keyof typeof moveCosts]||0;moveMP*=Math.max(0,monCount||0);return <div className="space-y-4"><Card className="space-y-4"><h2 className="text-xl font-bold">⚡ Max Battle & PokéCoin Calculator</h2><p className="muted text-sm">Estimate Max Particles and optional purchased packs. Adjust the pack rate to your in-game Shop, as prices vary.</p><div className="grid gap-3 md:grid-cols-3"><Select label="Battle cost" value={kind} set={setKind} options={[{value:'250',label:'1★ · 250 MP'},{value:'400',label:'3★ · 400 MP'},{value:'800',label:'5★/Gigantamax · 800 MP'},{value:'1000',label:'Other · 1,000 MP'}]}/><NumberField label="Number of battles" value={battles} set={setBattles} min={0}/><NumberField label="Owned / earned free MP" value={owned} set={setOwned} min={0}/></div><div className="grid gap-3 md:grid-cols-2"><NumberField label="MP per purchasable pack (editable)" value={packMP} set={setPackMP} min={1}/><NumberField label="PokéCoins per pack (editable)" value={packCoins} set={setPackCoins} min={0}/></div><Metrics items={[["Total MP needed",fmt(battleMP)],["MP shortfall",fmt(Math.max(0,battleMP-owned))],["Estimated PokéCoins",fmt(coinEstimate(battleMP,owned,packMP,packCoins))]]}/></Card><Card className="space-y-4"><h3 className="text-lg font-bold">Max Move Upgrade Planner — Dynamax & Gigantamax</h3><p className="muted text-sm">Separate upgrade calculations for a Max Battle-ready Pokémon. Adjust purchased particle packs and their PokéCoin price above. Estimated coins cover the Max Particle shortfall for Dynamax and Gigantamax upgrades.</p><div className="grid gap-3 md:grid-cols-4"><Select label="Move" value={move} set={setMove} options={[{value:'attack',label:'Max Attack'},{value:'guard',label:'Max Guard'},{value:'spirit',label:'Max Spirit'}]}/><Select label="Starting level" value={from} set={setFrom} options={[0,1,2].map(x=>({value:String(x),label:String(x)}))}/><Select label="Target level" value={to} set={setTo} options={[1,2,3].map(x=>({value:String(x),label:String(x)}))}/><NumberField label="Pokémon count" value={monCount} set={setMonCount} min={1}/></div>{Number(to)>Number(from)?<Metrics items={[["Upgrade MP",fmt(moveMP)],["Upgrade packs",Math.ceil(Math.max(0,moveMP-(owned||0))/Math.max(1,packMP))],["Estimated PokéCoins",fmt(coinEstimate(moveMP,owned||0,packMP||1,packCoins||0))]]}/>:<p className="text-amber-200">Target level must exceed starting level.</p>}</Card><EternatusCombinedTool/></div>}
// Eternatus has special Candy and Candy XL costs; level steps are exactly 0.5.
// Source: https://www.dittobase.com/pokemon-go/pokedex/eternatus (level-up table).
function eternatusPowerUpCost(start:number,end:number){
 let dust=0,candy=0,xl=0;
 for(let n=Math.round(start*2);n<Math.round(end*2);n++){
  const level=n/2;
  const dustBands:[[number,number],...Array<[number,number]>]=[[17,1900],[19,2200],[21,2500],[23,3000],[25,3500],[27,4000],[29,4500],[31,5000],[33,6000],[35,7000],[37,8000],[39,9000],[41,10000],[43,11000],[45,12000],[47,13000],[49,14000],[51,15000]];
  dust+=dustBands.find(([max])=>level<max)?.[1]||15000;
  if(level<40){
   const candyBands:[[number,number],...Array<[number,number]>]=[[21,60],[26,90],[31,120],[33,175],[35,225],[37,300],[39,375],[40,890]];
   candy+=candyBands.find(([max])=>level<max)?.[1]||0;
  }else{
   const xlBands:[[number,number],...Array<[number,number]>]=[[42,100],[44,200],[46,400],[48,635],[50,890]];
   xl+=xlBands.find(([max])=>level<max)?.[1]||0;
  }
 }
 return {dust,candy,xl,steps:Math.round((end-start)*2)};
}

function RaidEstimate({dust=0,candy=0,xl=0,eternatus=false}:{dust?:number;candy?:number;xl?:number;eternatus?:boolean}){
 const [d,setD]=useState(eternatus?25000:1000),[c,setC]=useState(eternatus?100:3),[x,setX]=useState(eternatus?50:0);
 const [doublingPrice,setDoublingPrice]=useState(eternatus?200:0);
 const [ownedPasses,setOwnedPasses]=useState(0),[ownedParticles,setOwnedParticles]=useState(0),[ownedPacks,setOwnedPacks]=useState(0),[freeParticles,setFreeParticles]=useState(0);
 const [particleCost,setParticleCost]=useState(800);
 const [threePrice,setThreePrice]=useState(eternatus?425:250);
 const estimate=(mult:number)=>{
  const needed=[{need:dust,yield:d},{need:candy,yield:c},{need:xl,yield:x}];
  if(needed.some(v=>v.need>0&&v.yield<=0))return null;
  return Math.max(0,...needed.map(v=>v.need>0?Math.ceil(v.need/(v.yield*mult)):0));
 };
 const packCount=(items:number)=>Math.ceil(Math.max(0,items)/3);
 const normal=estimate(1),doubled=estimate(2);
 const compute=(raids:number|null,double:boolean)=>{
  if(raids===null)return null;
  const particles=eternatus?raids*particleCost:0;
  const availableParticles=Math.max(0,ownedParticles)+Math.max(0,freeParticles)+Math.max(0,ownedPacks)*800;
  const needed=eternatus?Math.ceil(Math.max(0,particles-availableParticles)/800):Math.max(0,raids-ownedPasses);
  const packsToBuy=packCount(needed);
  const shopCoins=packsToBuy*threePrice;
  const bonusCoins=double?raids*doublingPrice:0;
  return {raids,particles,needed,packsToBuy,shopCoins,bonusCoins,total:shopCoins+bonusCoins};
 };
 const normalResult=compute(normal,false),doubleResult=compute(doubled,true);
 const renderResult=(r:ReturnType<typeof compute>)=>r===null?<p className="text-amber-200 text-sm">Cannot estimate: a required resource has zero rewards per battle.</p>:<Metrics items={[
  ['Battles / raids to complete',fmt(r.raids)],
  [eternatus?'Total battle Max Particles':'Raid passes required',fmt(eternatus?r.particles:r.raids)],
  [eternatus?'800-MP packs required':'Additional Premium Passes needed',fmt(r.needed)],
  ['3-packs to buy',fmt(r.packsToBuy)],
  ['Shop purchase PokéCoins',fmt(r.shopCoins)],
  ['Reward doubling PokéCoins',fmt(r.bonusCoins)],
  ['Total estimated PokéCoins',fmt(r.total)]
 ]}/>;
 return <div className="space-y-3 border-t border-sky-800 pt-4">
  <h4 className="font-semibold">{eternatus?'Eternamax Battle':'Raid'} rewards, passes and PokéCoins</h4>
  <p className="muted text-xs">{eternatus?'Eternatus rewards are historical estimates, not guaranteed for the next event.':'Enter the rewards applying to this Pokémon; Candy XL is not guaranteed.'} Doubled rewards are a hypothetical 2× scenario; only enable a paid bonus where your battle actually offers one.</p>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   <NumberField label="Stardust per battle" value={d} set={setD} min={0}/>
   <NumberField label="Applicable Candy per battle" value={c} set={setC} min={0}/>
   <NumberField label="Applicable Candy XL per battle" value={x} set={setX} min={0}/>
   <NumberField label="Coins per doubled-reward claim" value={doublingPrice} set={setDoublingPrice} min={0}/>
  </div>
  <h5 className="font-semibold text-sm">In-game Shop purchases (standard listings, not event boxes)</h5>
  {eternatus?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   <NumberField label="Max Particles per battle" value={particleCost} set={setParticleCost} min={0}/>
   <NumberField label="Max Particles already owned" value={ownedParticles} set={setOwnedParticles} min={0}/>
   <NumberField label="Stored 800-MP packs owned" value={ownedPacks} set={setOwnedPacks} min={0}/>
   <NumberField label="Free MP to collect during plan" value={freeParticles} set={setFreeParticles} min={0}/>
  </div>:<div className="grid gap-3 sm:grid-cols-2">
   <NumberField label="Free / already owned raid passes" value={ownedPasses} set={setOwnedPasses} min={0}/>
   <div className="text-sm text-sky-200 self-end pb-2">Assumes in-person raids and Premium Battle Passes, not Remote Raid Passes.</div>
  </div>}
  <NumberField label={eternatus?'3 Max Particle Packs · coins':'3 Premium Battle Passes · coins'} value={threePrice} set={setThreePrice} min={0}/>
  <div className="grid gap-3 lg:grid-cols-2">
   <div className="rounded-xl border border-sky-700 p-4 space-y-3"><h5 className="font-semibold">Normal rewards</h5>{renderResult(normalResult)}</div>
   <div className="rounded-xl border border-violet-500 p-4 space-y-3"><h5 className="font-semibold">Always doubled rewards (2×)</h5>{renderResult(doubleResult)}</div>
  </div>
  <p className="muted text-xs">Uses standard in-game Shop 3-packs only (three Premium Passes for 250 coins or three 800-MP Max Particle Packs for 425 coins by default). Purchases round up to complete 3-packs, so there may be leftover passes or particles. No singles are purchased. Excludes promotional boxes, Web Store bundles, free future raid passes, remote entry fees, daily MP collection unless entered, and event tickets. MP cost and shop prices can vary; check your in-game Shop. Pack calculations are totals, not a claim that all can be carried or opened simultaneously.</p>
 </div>
}
function EternatusCombinedTool(){
 const [current,setCurrent]=useState(20),[target,setTarget]=useState(50);
 const [enabled,setEnabled]=useState<string[]>(['attack']);
 const [levels,setLevels]=useState<Record<string,{start:string;end:string}>>({attack:{start:'1',end:'3'},guard:{start:'0',end:'3'},spirit:{start:'0',end:'3'}});
 const [dustOwned,setDustOwned]=useState(0),[candyOwned,setCandyOwned]=useState(0),[xlOwned,setXlOwned]=useState(0),[mpOwned,setMpOwned]=useState(0);
 const levelOptions=Array.from({length:71},(_,i)=>15+i/2);
 const pu=target>current?eternatusPowerUpCost(current,target):{dust:0,candy:0,xl:0,steps:0};
 const moveCosts:Record<string,{candy:number;xl:number;mp:number}>={'0-1':{candy:400,xl:0,mp:400},'1-2':{candy:1200,xl:0,mp:600},'2-3':{candy:1200,xl:320,mp:800}};
 let mc=0,mx=0,mp=0;
 for(const m of enabled){const cfg=levels[m];for(let i=+cfg.start;i<+cfg.end;i++){const k=moveCosts[`${i}-${i+1}`];if(k){mc+=k.candy;mx+=k.xl;mp+=k.mp}}}
 const totalDust=pu.dust,totalCandy=pu.candy+mc,totalXL=pu.xl+mx,totalMP=mp;
 const names:Record<string,string>={attack:'Dynamax Cannon',guard:'Max Guard',spirit:'Max Spirit'};
 const modify=(m:string,key:'start'|'end',v:string)=>setLevels(prev=>({...prev,[m]:{...prev[m],[key]:v}}));
 return <Card className="space-y-4">
  <div className="flex items-center gap-3"><img src="/api/pokemon-image?name=eternatus" alt="Eternatus" className="h-20 w-20 object-contain"/><div><h3 className="text-xl font-bold">Eternatus Candy & Power-Up Calculator</h3><p className="muted text-sm">One Eternatus: Pokémon power-ups and any 1, 2 or 3 Max Moves in a combined estimate.</p></div></div>
  <div className="grid gap-3 sm:grid-cols-2"><Select label="Current Pokémon level" value={String(current)} set={v=>setCurrent(+v)} options={levelOptions.map(n=>({value:String(n),label:`Level ${n}`}))}/><Select label="Target Pokémon level" value={String(target)} set={v=>setTarget(+v)} options={levelOptions.map(n=>({value:String(n),label:`Level ${n}`}))}/></div>
  <div className="space-y-2"><h4 className="font-semibold">Which Eternatus moves do you want to upgrade?</h4>
   <p className="muted text-xs">Select one, two, or all three. Each selected move has its own starting and target level.</p>
   {(['attack','guard','spirit'] as const).map(m=><div key={m} className="rounded-lg border border-sky-800 p-3 space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={enabled.includes(m)} onChange={e=>setEnabled(prev=>e.target.checked?[...prev,m]:prev.filter(v=>v!==m))}/>{names[m]}</label>
    {enabled.includes(m)&&<div className="grid gap-3 sm:grid-cols-2">
     <Select label="Current move level" value={levels[m].start} set={v=>modify(m,'start',v)} options={(m==='attack'?[1,2,3]:[0,1,2,3]).map(n=>({value:String(n),label:n===0?'Locked':`Level ${n}`}))}/>
     <Select label="Target move level" value={levels[m].end} set={v=>modify(m,'end',v)} options={[1,2,3].map(n=>({value:String(n),label:`Level ${n}`}))}/>
    </div>}
   </div>)}
  </div>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="Stardust owned" value={dustOwned} set={setDustOwned}/><NumberField label="Eternatus Candy owned" value={candyOwned} set={setCandyOwned}/><NumberField label="Eternatus Candy XL owned" value={xlOwned} set={setXlOwned}/><NumberField label="Max Particles owned" value={mpOwned} set={setMpOwned}/></div>
  <Metrics items={[["Power-up Stardust",fmt(totalDust)],["Power-up Candy",fmt(pu.candy)],["Power-up Candy XL",fmt(pu.xl)],["Move Candy",fmt(mc)],["Move Candy XL",fmt(mx)],["Move Max Particles",fmt(totalMP)],["Stardust shortfall",fmt(Math.max(0,totalDust-dustOwned))],["Total Candy shortfall",fmt(Math.max(0,totalCandy-candyOwned))],["Total Candy XL shortfall",fmt(Math.max(0,totalXL-xlOwned))],["Max Particle shortfall",fmt(Math.max(0,totalMP-mpOwned))]]}/>
  <RaidEstimate eternatus dust={Math.max(0,totalDust-dustOwned)} candy={Math.max(0,totalCandy-candyOwned)} xl={Math.max(0,totalXL-xlOwned)}/>
  <p className="muted text-xs">Costs are estimates based on saved Eternatus-specific tables. Max Move calculations exclude any selection whose target is not above its current level.</p>
 </Card>
}
function DustTool(){
 const [from,setFrom]=useState(20),[to,setTo]=useState(40),[ownedDust,setDust]=useState(0),[ownedCandy,setCandy]=useState(0);
 const steps=Math.max(0,Math.min(98,Math.round((to-from)*2)));let dust=0,candy=0,xl=0;
 for(let i=0;i<steps;i++){const l=from+i/2;dust+=l<20?Math.round(200+Math.floor(l/2)*250):l<40?Math.round(2500+(l-20)*625):15000;candy+=l>=40?0:l<30?Math.max(1,Math.floor(l/5)):Math.max(5,Math.floor((l-25)*.8));xl+=l>=40?Math.round(10+(l-40)):0}
 return <Card className="space-y-4"><h2 className="text-xl font-bold">✨ Stardust & Candy Calculator</h2><p className="muted text-sm">Estimate Pokémon power-up resource requirements. This calculator does not assume raids are your only source of Stardust or Candy. Cost figures are approximate.</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="Current Pokémon level" value={from} set={setFrom} min={1} max={50} step={.5}/><NumberField label="Target level" value={to} set={setTo} min={1} max={50} step={.5}/><NumberField label="Stardust on hand" value={ownedDust} set={setDust}/><NumberField label="Candy on hand" value={ownedCandy} set={setCandy}/></div>{to>from?<><Metrics items={[["Total Stardust required",fmt(dust)],["Total Candy required",fmt(candy)],["Estimated Candy XL",fmt(xl)],["Stardust shortfall",fmt(Math.max(0,dust-ownedDust))],["Candy shortfall",fmt(Math.max(0,candy-ownedCandy))]]}/><RaidEstimate dust={Math.max(0,dust-ownedDust)} candy={Math.max(0,candy-ownedCandy)} xl={xl}/></>:<p className="text-amber-200">Set a target level above the starting level.</p>}</Card>
}
function IVTool(){
 const [query,setQuery]=useState('');const [results,setResults]=useState<string[]>([]);const [name,setName]=useState('');const [pokemon,setPokemon]=useState<any>(null);
 const [a,setA]=useState(0),[d,setD]=useState(15),[s,setS]=useState(15);const [league,setLeague]=useState('1500');
 const [output,setOutput]=useState<any>(null);const [busy,setBusy]=useState(false);const [custom,setCustom]=useState(false);
 useEffect(()=>{if(query.length<2||query===name){setResults([]);return}const ctrl=new AbortController();const h=setTimeout(async()=>{try{const r=await fetch('/api/pokemon?q='+encodeURIComponent(query),{signal:ctrl.signal});const j=await r.json();setResults(j.results||[])}catch{}},300);return()=>{clearTimeout(h);ctrl.abort()}},[query,name]);
 const choose=async(n:string)=>{setName(n);setQuery(n);setResults([]);setOutput(null);setCustom(false);try{const r=await fetch('/api/pokemon?name='+encodeURIComponent(n));setPokemon(await r.json())}catch{setPokemon(null)}};
 useEffect(()=>{if(!pokemon?.stats)return;let cancelled=false;setBusy(true);setOutput(null);const h=setTimeout(()=>{const result=rankIV(pokemon.stats,custom?[a,d,s]:null,Number(league));if(!cancelled){setOutput(result);setBusy(false)}},45);return()=>{cancelled=true;clearTimeout(h)}},[pokemon,league,a,d,s,custom]);
 return <Card className="space-y-4"><h2 className="text-xl font-bold">🧬 Pokémon Search & PvP IV Ranking</h2><p className="muted text-sm">Search a Pokémon and view its top 10 IV spreads automatically for the chosen league. Enable custom IVs only when you want to check your own Pokémon. Rankings are approximate until GO-specific stats and exact CP multipliers are added.</p>
 <label className="field relative">Search Pokémon<Input placeholder="Type Pokémon name" value={query} onChange={e=>{setQuery(e.target.value);if(e.target.value!==name)setPokemon(null)}}/>{results.length>0&&<div className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-sky-700 bg-slate-950 shadow-xl">{results.map(n=><button className="block w-full p-2 text-left text-sm hover:bg-sky-900" key={n} onClick={()=>choose(n)}>{n}</button>)}</div>}</label>
 {pokemon?.stats&&<><div className="flex items-center gap-4"><img src={pokemon.sprite||sprite(pokemon.id)} width="88" height="88" alt={name}/><strong className="capitalize">{name}</strong></div>
 <Select label="League" value={league} set={setLeague} options={[{value:'500',label:'Little · 500 CP'},{value:'1500',label:'Great · 1500 CP'},{value:'2500',label:'Ultra · 2500 CP'},{value:'99999',label:'Master · uncapped'}]}/>
 {busy&&<p className="muted">Calculating rankings…</p>}{output&&<><h3 className="font-semibold">Top 10 IV combinations</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-sky-800"><th className="p-2">Rank</th><th className="p-2">Atk / Def / HP</th><th className="p-2">Level</th><th className="p-2">Stat product %</th></tr></thead><tbody>{output.top.map((x:any)=><tr className="border-b border-sky-950" key={x.rank}><td className="p-2">#{x.rank}</td><td className="p-2">{x.iv}</td><td className="p-2">{x.level}</td><td className="p-2">{x.percent}%</td></tr>)}</tbody></table></div></>}
 <label className="flex items-center gap-2"><input type="checkbox" checked={custom} onChange={e=>setCustom(e.target.checked)}/> Check my own IVs</label>{custom&&<><div className="grid grid-cols-3 gap-3"><NumberField label="Attack IV" value={a} set={setA} max={15}/><NumberField label="Defense IV" value={d} set={setD} max={15}/><NumberField label="HP IV" value={s} set={setS} max={15}/></div>{output?.checked&&<Metrics items={[["Your IV rank",`#${output.checked.rank} / ${output.checked.total}`],["Relative stat product",output.checked.percent+'%'],["Estimated level",output.checked.level]]}/>}</>}
 </>}<a className="text-sm underline" target="_blank" rel="noreferrer" href="https://pvpivs.com/">Compare exact PvP ranks at pvpivs.com</a></Card>
}
function RocketTool(){const [query,setQuery]=useState('');const list=rocket.filter(x=>(x.title+' '+x.taunt).toLowerCase().includes(query.toLowerCase()));
 return <Card className="space-y-4"><h2 className="text-xl font-bold">🚀 Team GO Rocket — Opponents & Counters</h2><p className="muted text-sm">Rocket portraits are sourced from Leek Duck. Opponent possibilities are the October 2, 2026 Leek Duck snapshot; refresh manually when the Rocket rotation changes. Counter teams are suggested, not guaranteed.</p><a className="text-sm underline" target="_blank" rel="noreferrer" href="https://leekduck.com/rocket-lineups/">Verify current Rocket lineups at Leek Duck</a>
 <Input placeholder="Search leader, Grunt type, or taunt" value={query} onChange={e=>setQuery(e.target.value)}/>
 <div className="grid gap-3 lg:grid-cols-2">{list.map(x=><div key={x.title} className="rounded-xl border border-sky-900 bg-slate-950/30 p-4"><div className="flex items-center gap-3"><img className="h-16 w-16 shrink-0 rounded-xl border border-sky-800 bg-slate-900" alt={x.title+' illustrated portrait'} src={x.title==='Giovanni'?'https://cdn.leekduck.com/assets/img/rocket/boss-giovanni.png':['Cliff','Arlo','Sierra'].includes(x.title)?'https://cdn.leekduck.com/assets/img/rocket/leader-'+x.title.toLowerCase()+'.png':'https://cdn.leekduck.com/assets/img/rocket/'+(x.title==='Normal Grunt'||x.title==='Water Grunt'||x.title==='Grass Grunt'||x.title==='Ground Grunt'?'male-grunt':'female-grunt')+'.png'} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=x.title==='Giovanni'?'/rocket/giovanni.svg':x.taunt==='Leader'?'/rocket/leader.svg':'/rocket/grunt.svg'}}/><div><h3 className="font-bold">{x.title}</h3><p className="muted text-xs">{x.taunt}</p></div></div><div className="mt-3"><strong className="text-xs text-sky-200">Possible opponents</strong><div className="mt-2 grid grid-cols-3 gap-2">{x.pokemon.map((slot,i)=><div key={i} className="space-y-1 rounded-lg border border-sky-900 p-2"><p className="text-xs text-sky-300">Slot {i+1}</p>{slot.includes('(varies)')?<p className="text-xs">Not confirmed for this slot; consult source</p>:slot.split(/\s*\/\s*/).map(n=><div key={n} className="flex items-center gap-1"><img className={`h-12 w-12 object-contain ${/^Shadow\s+/i.test(n)?'shadowmon':''}`} alt={n} loading="lazy" src={'/api/pokemon-image?name='+encodeURIComponent(n.replace(/^Shadow /,''))}/><span className={`text-xs ${/^Shadow\s+/i.test(n)?'shadowlabel':''}`}>{n}</span></div>)}</div>)}</div></div><div className="mt-3"><strong className="text-xs text-sky-200">Suggested counter lineup</strong><div className="mt-2 grid grid-cols-3 gap-2">{x.counters.map(n=><PokemonPic name={n} key={n} small/>)}</div></div></div>)}</div></Card>}

function HomeHub(){
 const [feedbackType,setFeedbackType]=useState('Feature suggestion');
 const [feedback,setFeedback]=useState('');
 const [copied,setCopied]=useState(false);
 const feedbackMessage=`AlfaMitsu Tracker — ${feedbackType}\n\n${feedback.trim()}`;
 const copyFeedback=async()=>{if(!feedback.trim())return;try{await navigator.clipboard.writeText(feedbackMessage);setCopied(true)}catch{setCopied(false)}};
 return <div className="space-y-6">
  <section className="relative overflow-hidden rounded-2xl border border-sky-700 bg-gradient-to-br from-[#0d3971] via-[#0b2851] to-[#07172f] p-6 md:p-9">
   <div className="relative z-10 max-w-3xl space-y-3">
    <p className="text-xs font-semibold uppercase tracking-[.22em] text-yellow-300">Welcome to AlfaMitsu Services</p>
    <h1 className="text-3xl font-bold leading-tight md:text-5xl">Your Pokémon GO companion</h1>
    <p className="max-w-2xl text-sm leading-7 text-sky-100 md:text-base">Stay informed about Pokémon GO events and discover useful resources in one place. Built for trainers who want a clear, easy-to-use experience.</p>
    <p className="text-xs text-sky-300">Independent fan-made tracker by AlfaMitsu Services. Not affiliated with the Pokémon Company or Scopely.</p>
   </div>
   <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[38px] border-sky-400/10"/>
  </section>
  <section aria-labelledby="whats-new" className="space-y-3">
   <div><h2 id="whats-new" className="text-2xl font-bold">Website Updates & Changelog</h2><p className="muted text-sm">A running history of tracker improvements, newest first. No version numbers.</p></div>
   <div className="grid gap-3 md:grid-cols-2">
    {([
     {title:'Removed live visitor statistics',detail:'Removed header visitor numbers, anonymous visitor tracking and the visitor analytics API.'},
     {title:'3-pack-only Shop estimates',detail:'Calculators now use standard 3-pack purchases only, automatically rounding up required passes or Max Particle Packs.'},
     {title:'Full raid and battle cost estimates',detail:'Normal and doubled reward scenarios show battles, passes or Max Particles, 3-packs needed, and total estimated PokéCoins.'},
     {title:'Eternatus raid reward comparison',detail:'Added editable Stardust, Candy and Candy XL rewards and normal-versus-doubled raid estimates.'},
     {title:'Combined Eternatus calculator',detail:'Power-ups and selected Max Move upgrades now share one calculator, with individual move level targets.'},
     {title:'Flexible Max Move selection',detail:'Choose one, two, or all three Eternatus moves; the number-of-Eternatus field and Adventure Effect calculator were removed.'},
     {title:'Missing Pokémon images corrected',detail:'Added image aliases for Darmanitan and Alolan Geodude, Ninetales, Exeggutor, Rattata, Sandshrew, Sandslash and Vulpix.'},
     {title:'Calculator number-entry improvements',detail:'Number fields can be cleared while typing instead of forcing the default zero to remain.'},
     {title:'Max Move and resource estimates',detail:'Added editable Max Particle and shop coin estimates, along with raid estimates for Stardust and Candy requirements.'},
     {title:'Team GO Rocket lineup details',detail:'Expanded grunt opponents into named possible lineups, including distinct Water grunt variants, using a dated roster.'},
     {title:'Eternatus Max Move and power-up planning',detail:'Added special Eternatus Candy, Candy XL and Stardust requirements for Pokémon power-ups and Max Move levels.'},
     {title:'Website Home information hub',detail:'Added Welcome & Introduction, Website Updates, Services Showcase, and Feedback & Suggestions without duplicate sidebar links.'},
     {title:'Simplified navigation and calculators',detail:'Removed Raid & Coin Estimate and the separate Website Visitors navigation page.'},
     {title:'Shadow raid display fixes',detail:'Only Pokémon explicitly identified as Shadow receive the purple Shadow appearance; normal recommended counters remain normal.'},
     {title:'Raid rotation updates',detail:'Added an external community raid data feed with refresh and expiry safeguards; source availability can affect updates.'}
    ]).map(item=><Card key={item.title} className="space-y-2"><h3 className="font-semibold">{item.title}</h3><p className="muted text-sm leading-6">{item.detail}</p></Card>)}
   </div>
  </section>
  <section aria-labelledby="services" className="space-y-3">
   <div><h2 id="services" className="text-2xl font-bold">AlfaMitsu Services</h2><p className="muted text-sm">Connect with us for available Pokémon GO services and community updates.</p></div>
   <Card className="space-y-4">
    <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
     <img src="/logo.png" alt="AlfaMitsu Services logo" className="h-24 w-36 rounded-xl border border-sky-900 bg-[#061936] object-contain p-2"/>
     <div className="space-y-2"><h3 className="text-xl font-semibold">Services and community</h3><p className="muted text-sm leading-6">Ask about raid assistance, account-related offerings, and other currently available services. Service details, availability, and pricing are confirmed directly with AlfaMitsu Services.</p></div>
    </div>
    <a href="https://discord.gg/qFHYUXPgaU" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600">Join our Discord community <ExternalLink size={15}/></a>
    <p className="break-all text-xs text-sky-300">https://discord.gg/qFHYUXPgaU</p>
   </Card>
  </section>
  <section aria-labelledby="feedback" className="space-y-3">
   <div><h2 id="feedback" className="text-2xl font-bold">Feedback & Suggestions</h2><p className="muted text-sm">Found a bug or have an idea? Tell us what could be improved.</p></div>
   <Card className="space-y-4">
    <label className="field">Feedback type<select className="select" value={feedbackType} onChange={e=>{setFeedbackType(e.target.value);setCopied(false)}}><option>Feature suggestion</option><option>Bug report</option><option>Other feedback</option></select></label>
    <label className="field">Your message<textarea className="select min-h-28 resize-y" maxLength={2000} value={feedback} onChange={e=>{setFeedback(e.target.value);setCopied(false)}} placeholder="Describe your idea or the problem you found..." /></label>
    <div className="flex flex-wrap items-center gap-3">
     <Button disabled={!feedback.trim()} onClick={copyFeedback}>{copied?'Copied!':'Copy feedback'}</Button>
     <a href="https://discord.gg/qFHYUXPgaU" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-sky-300 underline">Open Discord to share <ExternalLink size={13} className="inline"/></a>
    </div>
    <p className="muted text-xs">Feedback is not automatically submitted or stored. Copy your message and share it in our Discord server.</p>
   </Card>
  </section>
 </div>
}

export default function Page(){const [page,setPage]=useState('tracker');const [tool,setTool]=useState('raid');const [search,setSearch]=useState('');const [selected,setSelected]=useState<Event|null>(null);const [week,setWeek]=useState(0);const [showCompleted,setCompleted]=useState(false);const [mobileMenu,setMobileMenu]=useState(false);const [zoom,setZoom]=useState(false);
const now=new Date();const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7)+week*7);const days=Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(d.getDate()+i);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')});const status=(e:Event)=>{if(tba(e))return 'TBA';try{const fmt=(z:string)=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:z,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const v=(type:string)=>parts.find(x=>x.type===type)?.value||'00';return v('year')+v('month')+v('day')+v('hour')+v('minute')};const z=e.zone||'Pacific/Auckland';const endz=e.zone||'Pacific/Honolulu';const start=fmt(z),end=fmt(endz);const stamp=(s:string,t:string)=>s.replace(/-/g,'')+t.replace(':','');return end>=stamp(e.end,e.endTime||'23:59')?'Completed':start>=stamp(e.start,e.startTime||'00:00')?'Ongoing':'Upcoming'}catch{return 'Upcoming'}};
const visible=useMemo(()=>events.filter(e=>(showCompleted||status(e)!=='Completed')&&(e.name+' '+(e.detail||'')).toLowerCase().includes(search.toLowerCase())).sort(evSort),[showCompleted,search]);function navigate(p:string){setPage(p);setSelected(null);setMobileMenu(false)}const tools=[['raid','Raid Planner',Swords],['max','Max Battle Calculator',Zap],['dust','Stardust & Candy',Coins],['iv','IV & PvP Ranking',Dna],['rocket','Rocket Counters',Skull]] as const;
const displayEvent=(e:Event)=>{setSelected(e);setPage('detail');window.scrollTo({top:0,behavior:'smooth'})};return <div className="min-h-screen"><header className="sticky top-0 z-30 flex min-h-[76px] flex-wrap items-center gap-2 border-b border-sky-900 bg-[#061936] px-3 py-2 md:gap-3 md:px-8"><button className="md:hidden" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><button onClick={()=>navigate('tracker')} className="flex items-center"><img src="/logo.png" alt="AlfaMitsu Services" className="h-14 w-28 object-contain object-left"/></button><div className="ml-auto flex w-48 items-center gap-2 rounded-xl border border-sky-800 bg-[#0b2749] px-3 sm:w-72"><Search size={18}/><input className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value)navigate('events')}} placeholder="Search events..."/></div></header><div className="flex"><aside className={`${mobileMenu?'block':'hidden'} w-56 shrink-0 border-r border-sky-900 bg-[#061d3b] p-3 md:block md:min-h-[calc(100vh-76px)]`}>{[['home','Home'],['tracker','Event Tracker'],['events','Events List'],['guides','Guides'],['tools','Tools']].map(([k,l])=><button key={k} onClick={()=>navigate(k)} className={`my-1 w-full rounded-lg px-4 py-3 text-left text-sm ${page===k||page==='detail'&&k==='events'?'bg-blue-800':'hover:bg-sky-900'}`}>{l}</button>)}<p className="mt-8 border-t border-sky-900 pt-4 text-xs tracking-widest text-sky-300">GAME</p><p className="mt-3 text-sm">◉ Pokémon GO</p></aside><main className="mx-auto w-full min-w-0 max-w-[1550px] space-y-5 p-4 md:p-8">{page==='tracker'&&<><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">GO Weekly</h1><p className="muted">Global events and location-exclusive events · Click any event</p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>setWeek(week-1)}><ChevronLeft size={18}/></Button><Button variant="outline" onClick={()=>setWeek(0)}>This Week</Button><Button variant="outline" onClick={()=>setWeek(week+1)}><ChevronRight size={18}/></Button></div></div><div className="overflow-x-auto"><div className="grid min-w-[940px] grid-cols-7 gap-3">{days.map(date=><Card key={date} className="min-h-80 p-3"><h3 className="mb-3 border-b border-sky-900 pb-2 text-center font-bold">{nice(date)}</h3>{events.filter(e=>!e.zone&&!tba(e)&&e.start<=date&&e.end>=date).slice(0,25).map(e=><button onClick={()=>displayEvent(e)} className="mb-2 w-full rounded-lg border border-sky-900 bg-[#123b76] p-2 text-left text-xs hover:bg-[#155ca5]" key={e.id}>{poster(e)&&<img src={poster(e)} alt="Event poster" className="mb-1 h-20 w-full rounded object-contain"/>}{e.name}</button>)}</Card>)}</div></div><h2 className="text-xl font-semibold">Regional / Location-exclusive events</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{events.filter(e=>e.zone&&e.start<=days[6]&&e.end>=days[0]).sort(evSort).map(e=><Card key={e.id} className="cursor-pointer" onClick={()=>displayEvent(e)}><p className="text-xs text-sky-300">{e.zone}</p><h3 className="font-bold">{e.name}</h3><p className="muted text-xs">{nice(e.start)}</p></Card>)}</div></>}
{page==='events'&&<><h1 className="text-3xl font-bold">Pokémon GO Events</h1><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showCompleted} onChange={e=>setCompleted(e.target.checked)}/> Show completed events</label><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map(e=><Card key={e.id} className="flex cursor-pointer gap-3 hover:border-sky-500" onClick={()=>displayEvent(e)}>{poster(e)&&<img src={poster(e)} alt="Event poster" className="h-28 w-24 shrink-0 rounded-lg object-cover"/>}<div><span className="pill">{status(e)}</span><h3 className="my-2 font-bold">{e.name}</h3><p className="muted text-xs">{tba(e)?'TBA':nice(e.start)+' – '+nice(e.end)}</p><p className="mt-1 text-xs text-sky-200">{e.zone||'Global'}</p></div></Card>)}</div></>}
{page==='detail'&&selected&&<><Button variant="ghost" onClick={()=>navigate('events')}>← Back to Events</Button><h1 className="text-3xl font-bold">{selected.name}</h1><div className="grid gap-5 lg:grid-cols-[minmax(240px,0.7fr)_1fr]"><Card>{poster(selected)?<button onClick={()=>setZoom(true)} className="w-full"><img className="poster" src={poster(selected)} alt={selected.name+' poster'}/><span className="mt-2 block text-sm">Enlarge poster</span></button>:<p className="muted">No verified poster attached for this event</p>}</Card><Card className="space-y-4"><span className="pill">{status(selected)}</span><Metrics items={[["Event dates",tba(selected)?'TBA':nice(selected.start)+' – '+nice(selected.end)],["Event area",selected.zone||'Global']]}/><h2 className="text-lg font-bold">Event details</h2><p>{selected.detail||'No verified event bonuses listed. Check the linked event source for details.'}</p><p className="text-xs text-sky-200">Some event details are sourced from the saved event schedule; poster text may provide further information.</p><div className="flex flex-wrap gap-2"><Button onClick={()=>{setTool('raid');navigate('tools')}}>Open Raid Planner</Button><Button variant="outline" onClick={()=>{setTool('max');navigate('tools')}}>Max Battle Calculator</Button></div></Card></div></>}
{page==='tools'&&<><h1 className="text-3xl font-bold">Pokémon GO Tools</h1><p className="muted">Plan raids, calculate Stardust and Candy requirements, rank PvP IVs, and counter Rocket battles.</p><div className="grid gap-4 lg:grid-cols-[225px_minmax(0,1fr)]"><div className="flex flex-wrap content-start gap-2 lg:flex-col">{tools.map(([k,l,Icon])=><Button className="justify-start" key={k} variant={tool===k?'default':'outline'} onClick={()=>setTool(k)}><Icon size={16} className="mr-2"/>{l}</Button>)}</div><div className="min-w-0">{tool==='raid'?<RaidTool/>:tool==='max'?<MaxTool/>:tool==='dust'?<DustTool/>:tool==='iv'?<IVTool/>:<RocketTool/>}</div></div></>}
{page==='home'&&<HomeHub/>}
{page==='guides'&&<><h1 className="text-3xl font-bold">Guides</h1><Card><p className="muted">Guides are being organized. For current raid and Rocket guidance, visit the Tools section.</p></Card></>}
</main></div>{zoom&&selected&&poster(selected)&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-5" onClick={()=>setZoom(false)}><button className="absolute right-5 top-5 text-3xl">×</button><img src={poster(selected)} alt="Full event poster" className="max-h-[90vh] max-w-full object-contain"/></div>}</div>}

