// Pokémon GO-only type interactions (NOT the mainline-game 2x/0.5x chart).
// Sources: Pokémon GO type-effectiveness chart and Pokémon GO Help Center.
export const GO_TYPES=Object.freeze(['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']);
const ROWS={
normal:{strong:'',resist:'rock steel',immune:'ghost'},
fire:{strong:'grass ice bug steel',resist:'fire water rock dragon'},
water:{strong:'fire ground rock',resist:'water grass dragon'},
electric:{strong:'water flying',resist:'electric grass dragon',immune:'ground'},
grass:{strong:'water ground rock',resist:'fire grass poison flying bug dragon steel'},
ice:{strong:'grass ground flying dragon',resist:'fire water ice steel'},
fighting:{strong:'normal ice rock dark steel',resist:'poison flying psychic bug fairy',immune:'ghost'},
poison:{strong:'grass fairy',resist:'poison ground rock ghost',immune:'steel'},
ground:{strong:'fire electric poison rock steel',resist:'grass bug',immune:'flying'},
flying:{strong:'grass fighting bug',resist:'electric rock steel'},
psychic:{strong:'fighting poison',resist:'psychic steel',immune:'dark'},
bug:{strong:'grass psychic dark',resist:'fire fighting poison flying ghost steel fairy'},
rock:{strong:'fire ice flying bug',resist:'fighting ground steel'},
ghost:{strong:'psychic ghost',resist:'dark',immune:'normal'},
dragon:{strong:'dragon',resist:'steel',immune:'fairy'},
dark:{strong:'psychic ghost',resist:'fighting dark fairy'},
steel:{strong:'ice rock fairy',resist:'fire water electric steel'},
fairy:{strong:'fighting dragon dark',resist:'fire poison steel'}
};
const tokens=(value)=>value?value.split(' ').filter(Boolean):[];
export function goTypeMultiplier(attackType,defenderTypes){
 const row=ROWS[String(attackType).toLowerCase()];
 if(!row||!Array.isArray(defenderTypes)||!defenderTypes.length||defenderTypes.length>2)return null;
 let total=1;
 for(const raw of defenderTypes){
  const type=String(raw).toLowerCase();
  if(!GO_TYPES.includes(type))return null;
  total*=tokens(row.strong).includes(type)?1.6:tokens(row.resist).includes(type)?.625:tokens(row.immune).includes(type)?.390625:1;
 }
 return Number(total.toFixed(6));
}
export function goTypeMatchups(defenderTypes){
 if(!Array.isArray(defenderTypes)||!defenderTypes.length)return [];
 return GO_TYPES.map(type=>({type,multiplier:goTypeMultiplier(type,defenderTypes)}))
  .filter(item=>item.multiplier!==null)
  .sort((a,b)=>b.multiplier-a.multiplier||a.type.localeCompare(b.type));
}
export const GO_WEATHER_TYPES=Object.freeze({
 'none':[],sunny:['fire','grass','ground'],rainy:['water','electric','bug'],
 'partly-cloudy':['normal','rock'],cloudy:['fairy','fighting','poison'],
 windy:['flying','dragon','psychic'],snow:['ice','steel'],fog:['dark','ghost']
});
export function matchupForMove(attackType,defenderTypes,{sameType=false,weather='none'}={}){
 const base=goTypeMultiplier(attackType,defenderTypes);
 if(base===null)return null;
 const weatherBoost=(GO_WEATHER_TYPES[weather]||[]).includes(attackType)?1.2:1;
 return Number((base*(sameType?1.2:1)*weatherBoost).toFixed(6));
}
export function maxMoveCost(move,from,to,{group='A'}={}){
 const start=Number(from),target=Number(to);
 const candyGroups={A:[50,100,40],B:[60,110,45],C:[70,120,50],D:[80,130,55]};
 if(!['attack','guard','spirit'].includes(move)||!Number.isInteger(start)||!Number.isInteger(target) ||start<0||target>3||target<=start)return null;
 if(move==='attack'&&start===0)return null;
 if(!(group in candyGroups))return null;
 let mp=0,candy=0,candyXL=0;
 for(let level=start+1;level<=target;level++){
  mp+=level===1?400:level===2?600:800;
  if(level===3)candyXL+=candyGroups[group][2];
  else candy+=candyGroups[group][level===1?0:1];
 }
 return {mp,candy,candyXL,group,move,from:start,to:target};
}
// This helper deliberately avoids assigning DPS, win probabilities, battle times,
// or 'best moves' without verified Pokémon GO move-specific combat simulations.
export function coverageCandidates(candidates,defenderTypes){
 if(!Array.isArray(candidates)||!Array.isArray(defenderTypes))return [];
 return candidates.map((candidate,index)=>{
  const types=Array.isArray(candidate.types)?candidate.types.filter(x=>GO_TYPES.includes(x)):[];
  const max=types.map(type=>goTypeMultiplier(type,defenderTypes)).filter(x=>x!==null);
  return {...candidate,originalOrder:index,possibleTypeCoverage:max.length?Math.max(...max):null};
 }).sort((a,b)=>(b.possibleTypeCoverage??-1)-(a.possibleTypeCoverage??-1)||a.originalOrder-b.originalOrder);
}
