// Static IDs make official artwork load even when live PokeAPI requests are unavailable.
// Additional names can use the API-based discovery route.
export const artworkIds:Record<string,number>={'venusaur':3,'charizard':6,'blastoise':9,'beedrill':15,'pidgeot':18,'rattata':19,'sandshrew':27,'sandslash':28,'vulpix':37,'ninetales':38,'alakazam':65,'machamp':68,'geodude':74,'golem':76,'slowbro':80,'gengar':94,'exeggutor':103,'kangaskhan':115,'pinsir':127,'gyarados':130,'aerodactyl':142,'snorlax':143,'dragonite':149,'mewtwo':150,'ampharos':181,'steelix':208,'scizor':212,'heracross':214,'houndoom':229,'tyranitar':248,'sceptile':254,'blaziken':257,'swampert':260,'gardevoir':282,'sableye':302,'mawile':303,'aggron':306,'medicham':308,'manectric':310,'sharpedo':319,'camerupt':323,'altaria':334,'feebas':349,'banette':354,'absol':359,'salamence':373,'metagross':376,'latias':380,'latios':381,'kyogre':382,'groudon':383,'rayquaza':384,'roserade':407,'rampardos':409,'lopunny':428,'garchomp':445,'lucario':448,'weavile':461,'rhyperior':464,'togekiss':468,'glaceon':471,'mamoswine':473,'gallade':475,'dialga':483,'palkia':484,'giratina':487,'darkrai':491,'arceus':493,'excadrill':530,'conkeldurr':534,'darmanitan':555,'hydreigon':635,'terrakion':639,'tornadus':641,'thundurus':642,'reshiram':643,'zekrom':644,'landorus':645,'greninja':658,'diancie':719,'primarina':730,'nihilego':793,'xurkitree':796,'kartana':798,'necrozma':800,'eternatus':890,'enamorus':905,'koraidon':1007,'miraidon':1008,'giratina-origin':10007,'gengar-mega':10038,'tyranitar-mega':10049,'gardevoir-mega':10051,'garchomp-mega':10058,'lucario-mega':10059,'latias-mega':10062,'latios-mega':10063,'sableye-mega':10066,'diancie-mega':10075,'kyogre-primal':10077,'groudon-primal':10078,'rayquaza-mega':10079,'charizard-mega-x':10034,'charizard-mega-y':10035,'metagross-mega':10076,'rattata-alola':10091,'sandshrew-alola':10101,'sandslash-alola':10102,'vulpix-alola':10103,'ninetales-alola':10104,'geodude-alola':10109,'exeggutor-alola':10114,'darmanitan-galar-standard':10177,'darmanitan-galar-zen':10178,'eternatus-eternamax':10190,'necrozma-dusk':10155,'necrozma-dawn':10156,'necrozma-ultra':10157,'landorus-therian':10021,'thundurus-therian':10020,'tornadus-therian':10019,'enamorus-therian':10249};
export function canonicalPokemonName(input:string){
 let n=input.toLowerCase().replace(/^shadow\s+/,'').replace(/\s+—.*$/,'').replace(/[’']/g,'').replace(/\([^)]*\)/g,m=>'-'+m.slice(1,-1)).replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
 n=n.replace(/^mega-([a-z0-9-]+)-([xy])$/,'$1-mega-$2').replace(/^mega-(.+)$/,'$1-mega').replace(/^primal-(.+)$/,'$1-primal').replace(/^alolan-(.+)$/,'$1-alola').replace(/^galarian-(.+)$/,'$1-galar').replace(/^hisuian-(.+)$/,'$1-hisui').replace(/^paldean-(.+)$/,'$1-paldea');
 if(n==='darmanitan-galar')n='darmanitan-galar-standard';
 if(n==='darmanitan')n='darmanitan';
 if(n==='giratina-origin-forme')n='giratina-origin';
 if(n==='landorus-incarnate'||n==='thundurus-incarnate'||n==='tornadus-incarnate'||n==='enamorus-incarnate')n=n.split('-')[0];
 return n;
}
export function artworkUrl(name:string){
 const n=canonicalPokemonName(name);
 const id=artworkIds[n];
 return id?`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`:null;
}
