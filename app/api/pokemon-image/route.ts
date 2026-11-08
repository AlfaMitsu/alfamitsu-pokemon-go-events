import {NextRequest,NextResponse} from 'next/server';
import {artworkIds,normalizeGoName,realGoFormAssets,lookupSpecies} from '@/lib/pokemon-images';
import variantAssets from '@/lib/pogo-variant-assets.json';
export const runtime='nodejs';
const assetBase='https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/';
const safeSvg=(name:string)=>'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="100%" height="100%" rx="24" fill="#12254b"/><circle cx="128" cy="100" r="61" fill="#0f1d3a" stroke="#80ddff" stroke-width="10"/><path d="M67 100h122" stroke="#80ddff" stroke-width="9"/><circle cx="128" cy="100" r="22" fill="#0f1d3a" stroke="#80ddff" stroke-width="9"/><text x="128" y="209" text-anchor="middle" font-size="15" font-family="Arial" fill="white">Image unavailable</text></svg>';
async function good(url:string){
 try {const r=await fetch(url,{next:{revalidate:604800},signal:AbortSignal.timeout(3500)});return r.ok&&(r.headers.get('content-type')||'').startsWith('image/');}
 catch{return false;}
}
export async function GET(req:NextRequest){
 const raw=(req.nextUrl.searchParams.get('name')||'').trim();
 if(!raw||raw.length>110)return new NextResponse(null,{status:404});
 const lower=raw.toLowerCase().replace(/^shadow\s+/,'');
 const exact=realGoFormAssets[lower];
 if(exact){
   const u=assetBase+exact;
   if(await good(u))return NextResponse.redirect(u,{status:307});
 }
 const aliases:Record<string,string>={
 'alolan grimer':'grimer-alola','primal kyogre':'kyogre-primal','primal groudon':'groudon-primal',
 'mega gengar':'gengar-mega','mega sableye':'sableye-mega','mega lucario':'lucario-mega',
 'mega garchomp':'garchomp-mega','mega charizard x':'charizard-mega-x','mega charizard y':'charizard-mega-y',
 'mega rayquaza':'rayquaza-mega','mega gardevoir':'gardevoir-mega','mega diancie':'diancie-mega',
 'origin forme giratina':'giratina-origin','giratina origin':'giratina-origin',
 'galarian weezing':'weezing-galar','galarian darmanitan':'darmanitan-galar-standard',
 'galarian darmanitan zen':'darmanitan-galar-zen','eternamax eternatus':'eternatus-eternamax',
 'machamp (modern jacket)':'machamp','machamp wearing a modern jacket':'machamp',
 'singapore afro pikachu':'pikachu','blue pokexciting pikachu':'pikachu',
 'blue pokéxciting pikachu':'pikachu','pokexciting pikachu (blue)':'pikachu',
 'crowned sword zacian':'zacian','crowned shield zamazenta':'zamazenta',
 'landorus therian':'landorus-therian','enamorus therian':'enamorus-therian'
 };
 const canonical=aliases[lower]||normalizeGoName(raw);
 const base=canonical.replace(/-mega(-[xy])?$/,'').replace(/-primal$/,'').replace(/-(alola|galar|hisui)$/,'');
 const id=artworkIds[canonical]||artworkIds[base]||lookupSpecies(raw);

 // Resolve confirmed base species directly to real artwork; avoid API timeouts.
 if(id && !/(mega|primal|crowned|origin|therian|alolan|galarian|hisuian|paldean|costume|afro|pokexciting|pokéxciting|jacket|hat)/i.test(raw)){
   const url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'+id+'.png';
   return NextResponse.redirect(url,{status:307,headers:{'Cache-Control':'public, s-maxage=86400'}});
 }

 // Match actual form/costume codes from the GO game asset catalogue.
 // Never guess a costume on the basis of color alone.
 const variants=(variantAssets as Record<string,string[]>)[String(id)]||[];
 const normalized=lower.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ');
 const exactFormNames:Record<string,string>={
   'pikachu wearing a kurta':'fKURTA',
   'pikachu kurta':'fKURTA',
   'pikachu wearing a saree':'fSAREE',
   'pikachu saree':'fSAREE',
   'gigantamax pikachu':'fGIGANTAMAX',
   'gigantamax charizard':'fGIGANTAMAX',
   'gigantamax blastoise':'fGIGANTAMAX',
   'gigantamax venusaur':'fGIGANTAMAX',
   'gigantamax meowth':'fGIGANTAMAX',
   'gigantamax rillaboom':'fGIGANTAMAX',
   'gigantamax cinderace':'fGIGANTAMAX',
   'gigantamax duraludon':'fGIGANTAMAX'
 };
 const explicit=exactFormNames[lower]||null;
 const chosen=explicit&&variants.includes(explicit)?explicit:null;
 // For other costumes, only select an asset if its unique descriptive
 // tokens are explicitly represented in the Pokémon's displayed name.
 const code=chosen||variants.find(v=>{
   if(!/\b(costume|wearing|hat|scarf|bow|flower|goggles|tiara|kurta|saree|winter|holiday|halloween|gofest)\b/i.test(raw))return false;
   const tokens=v.slice(1).toLowerCase().split('_').filter(t=>t.length>3&&!['noevolve','costume','shiny'].includes(t)&&!/^20\d\d$/.test(t));
   return tokens.length>0 && tokens.every(t=>normalized.split(' ').includes(t));
 });
 if(code){
   const url=assetBase+'pm'+id+'.'+code+'.icon.png';
   if(await good(url))return NextResponse.redirect(url,{status:307,headers:{'Cache-Control':'public, s-maxage=86400'}});
 }
 for(const candidate of Array.from(new Set([canonical,base]))){
   if(!/^[a-z0-9-]{1,80}$/.test(candidate))continue;
   try{
     const r=await fetch('https://pokeapi.co/api/v2/pokemon/'+candidate,{next:{revalidate:86400},signal:AbortSignal.timeout(3500)});
     if(!r.ok)continue;
     const data=await r.json();
     const url=data.sprites?.other?.['official-artwork']?.front_default||data.sprites?.other?.home?.front_default||data.sprites?.front_default;
     if(url&&url.startsWith('https://'))return NextResponse.redirect(url,{status:307});
   }catch{}
 }
 if(id){
   const url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'+id+'.png';
   if(await good(url))return NextResponse.redirect(url,{status:307});
   const goUrl=assetBase+'pm'+id+'.icon.png';
   if(await good(goUrl))return NextResponse.redirect(goUrl,{status:307});
 }
 return new NextResponse(safeSvg(raw),{headers:{'content-type':'image/svg+xml; charset=utf-8','cache-control':'public, s-maxage=86400'}});
}
