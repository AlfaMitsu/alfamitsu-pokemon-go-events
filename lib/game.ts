export const sprite=(id:number|string)=>`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
// Costs are configurable assumptions, not live store prices.
export const coinEstimate=(required:number,owned:number,particlesPerPack:number,coinsPerPack:number)=>Math.ceil(Math.max(0,required-owned)/Math.max(1,particlesPerPack))*Math.max(0,coinsPerPack);
export const fmt=(n:number)=>(Number.isFinite(n)?Math.round(n):0).toLocaleString();
export function cp(atk:number,def:number,sta:number,ivs:[number,number,number],level:number){const m=.094+(.8403-.094)*Math.sqrt(Math.max(0,Math.min(1,(level-1)/49)));return Math.max(10,Math.floor((atk+ivs[0])*Math.sqrt(def+ivs[1])*Math.sqrt(sta+ivs[2])*m*m/10))}
export function rankIV(stats:{attack:number;defense:number;stamina:number},iv:[number,number,number]|null,cap:number){
 const all:{score:number;iv:string;level:number}[]=[];
 for(let a=0;a<16;a++)for(let d=0;d<16;d++)for(let s=0;s<16;s++){
  let best={score:0,level:1};
  for(let l=1;l<=50;l+=.5){
   if(cp(stats.attack,stats.defense,stats.stamina,[a,d,s],l)>cap)break;
   const m=.094+(.8403-.094)*Math.sqrt((l-1)/49);
   const score=(stats.attack+a)*m*(stats.defense+d)*m*Math.floor((stats.stamina+s)*m);
   if(score>best.score)best={score,level:l};
  }
  all.push({...best,iv:`${a}/${d}/${s}`});
 }
 all.sort((x,y)=>y.score-x.score);
 const top=all.slice(0,10).map((x,i)=>({...x,rank:i+1,percent:(x.score/Math.max(1,all[0].score)*100).toFixed(2)}));
 const index=iv?all.findIndex(x=>x.iv===iv.join('/')):-1;
 return {top,checked:index<0?null:{rank:index+1,total:all.length,level:all[index].level,percent:(all[index].score/Math.max(1,all[0].score)*100).toFixed(2)}};
}
export const rocket=[
{title:'Giovanni',taunt:'Boss',pokemon:['Persian','Kangaskhan / Rhyperior / Machamp','Shadow Zekrom'],counters:['Lucario','Swampert','Mamoswine']},
{title:'Cliff',taunt:'Leader',pokemon:['Cubone','Snorlax / Golurk / Galarian Weezing','Tyranitar / Camerupt / Gallade'],counters:['Lucario','Swampert','Metagross']},
{title:'Arlo',taunt:'Leader',pokemon:['Alolan Grimer','Steelix / Golurk / Slowbro','Alakazam / Charizard / Scizor'],counters:['Groudon','Darkrai','Reshiram']},
{title:'Sierra',taunt:'Leader',pokemon:['Pancham','Blastoise / Flygon / Ferrothorn','Milotic / Houndoom / Steelix'],counters:['Gardevoir','Mamoswine','Swampert']},
{title:'Normal Grunt',taunt:'Normal does not mean weak',pokemon:['Teddiursa / Hoothoot / Porygon','Loudred / Stufful / Starly','Ursaring / Swellow / Kangaskhan'],counters:['Lucario','Machamp','Terrakion']},
{title:'Water Grunt',taunt:'These waters are treacherous',pokemon:['Mudkip / Tentacool / Krabby','Dewpider / Swampert / Sharpedo','Walrein / Greninja / Tentacruel'],counters:['Kartana','Zekrom','Roserade']},
{title:'Water Male Grunt',taunt:'These waters are treacherous',pokemon:['Magikarp / Feebas','Magikarp','Magikarp / Gyarados'],counters:['Kartana','Zekrom','Roserade']},
{title:'Fire Grunt',taunt:'Do you know how hot Pokémon fire breath can get?',pokemon:['Litwick / Ponyta / Torchic','Magmar / Blaziken / Camerupt','Darmanitan / Delphox / Magmortar'],counters:['Kyogre','Swampert','Rhyperior']},
{title:'Grass Grunt',taunt:'Don’t tangle with us',pokemon:['Phantump / Fomantis / Tangela','Lileep / Sceptile / Morelull','Chesnaught / Trevenant / Cradily'],counters:['Reshiram','Darmanitan','Mamoswine']},
{title:'Electric Grunt',taunt:'Get ready to be shocked',pokemon:['Voltorb / Shinx / Helioptile','Electabuzz / Voltorb / Alolan Geodude','Luxray / Ampharos / Galvantula'],counters:['Groudon','Garchomp','Excadrill']},
{title:'Ice Grunt',taunt:'You’re gonna be frozen in your tracks',pokemon:['Seel / Delibird / Spheal','Sealeo / Froslass / Alolan Ninetales','Aurorus / Froslass / Glalie'],counters:['Reshiram','Metagross','Lucario']},
{title:'Fighting Grunt',taunt:'This buff physique isn’t just for show',pokemon:['Timburr / Mankey / Machop','Hitmontop / Hitmonlee / Hitmonchan','Conkeldurr / Annihilape / Infernape'],counters:['Mewtwo','Gardevoir','Togekiss']},
{title:'Poison Grunt',taunt:'Coiled and ready to strike',pokemon:['Oddish / Zubat / Qwilfish','Galarian Weezing / Nidorino / Nidorina','Weezing / Toxicroak / Amoonguss'],counters:['Groudon','Mewtwo','Excadrill']},
{title:'Ground Grunt',taunt:'You’ll be defeated into the ground',pokemon:['Rhyhorn / Gligar / Trapinch','Gligar / Claydol / Vibrava','Golurk / Hippowdon / Flygon'],counters:['Kyogre','Kartana','Mamoswine']},
{title:'Flying Grunt',taunt:'Battle against my Flying-type Pokémon',pokemon:['Taillow / Rookidee / Swablu','Scyther / Zubat / Gligar','Dragonite / Toucannon / Swanna'],counters:['Rampardos','Rhyperior','Mamoswine']},
{title:'Psychic Grunt',taunt:'Are you scared of psychics',pokemon:['Wobbuffet / Ralts / Drowzee','Drowzee / Duosion / Wobbuffet','Gallade / Malamar / Reuniclus'],counters:['Tyranitar','Darkrai','Hydreigon']},
{title:'Bug Grunt',taunt:'Go, my super bug Pokémon',pokemon:['Venonat / Weedle / Wimpod','Pinsir / Anorith / Dewpider','Scizor / Scolipede / Vikavolt'],counters:['Reshiram','Rhyperior','Rampardos']},
{title:'Rock Grunt',taunt:'Let’s rock and roll',pokemon:['Onix / Kabuto / Cranidos','Shieldon / Graveler / Cranidos','Tyrantrum / Golem / Aurorus'],counters:['Kyogre','Kartana','Lucario']},
{title:'Ghost Grunt',taunt:'Ke... ke... ke... ke!',pokemon:['Duskull / Sandygast / Yamask','Dusclops / Sableye / Cofagrigus','Gengar / Froslass / Cofagrigus'],counters:['Darkrai','Hydreigon','Tyranitar']},
{title:'Dragon Grunt',taunt:'ROAR! How’d that sound?',pokemon:['Noibat / Deino / Axew','Alolan Exeggutor / Dragonair / Gabite','Dragonite / Garchomp / Salamence'],counters:['Mamoswine','Gardevoir','Dialga']},
{title:'Dark Grunt',taunt:'Wherever there is light, there is also shadow',pokemon:['Carvanha / Poochyena / Alolan Rattata','Sneasel / Houndour / Absol','Liepard / Hydreigon'],counters:['Lucario','Togekiss','Gardevoir']},
{title:'Steel Grunt',taunt:'You’re no match for my iron will',pokemon:['Alolan Sandshrew / Aron / Beldum','Lairon / Skarmory / Metang','Aggron / Alolan Sandslash / Probopass'],counters:['Groudon','Reshiram','Lucario']},
{title:'Fairy Grunt',taunt:'Check out my cute Pokémon',pokemon:['Ralts / Snubbull / Alolan Vulpix','Snubbull / Galarian Weezing / Kirlia','Alolan Ninetales / Galarian Weezing / Granbull'],counters:['Metagross','Nihilego','Dialga']},
{title:'Starter Grunt',taunt:'Mixed / starter lineups',pokemon:['Bulbasaur / Charmander / Squirtle','Ivysaur / Charmeleon / Wartortle','Venusaur / Charizard / Blastoise'],counters:['Mewtwo','Kyogre','Lucario']},
];
