import {NextRequest,NextResponse} from 'next/server';
import {artworkIds,normalizeGoName,realGoFormAssets} from '@/lib/pokemon-images';
import costumeAssets from '@/lib/pogo-costume-assets.json';
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
 'crowned sword zacian':'zacian','crowned shield zamazenta':'zamazenta',
 'landorus therian':'landorus-therian','enamorus therian':'enamorus-therian'
 };
 const canonical=aliases[lower]||normalizeGoName(raw);
 const base=canonical.replace(/-mega(-[xy])?$/,'').replace(/-primal$/,'').replace(/-(alola|galar|hisui)$/,'');
 const id=artworkIds[canonical]||artworkIds[base];
 // Match costumes only if the costume identifier is explicitly present in the request.
 if(id&&/(wearing|costume|hat|cap|jacket|scarf|crown|bow|cape|flower|hanbok)/i.test(raw)){
   const codes=(costumeAssets as Record<string,string[]>)[String(id)]||[];
   const query=lower.replace(/[^a-z0-9]/g,'');
   const match=codes.find(v=>{
     const keys=v.slice(1).split('_').filter(s=>s.length>3&&!/^(NOEVOLVE|SHINY)$/.test(s));
     return keys.length>0&&keys.every(x=>query.includes(x.toLowerCase()));
   });
   if(match){
     const url=assetBase+'pm'+id+'.'+match+'.icon.png';
     if(await good(url))return NextResponse.redirect(url,{status:307});
   }
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
