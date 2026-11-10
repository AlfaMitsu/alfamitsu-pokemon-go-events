import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
export const revalidate=86400;
const allow=/^[a-z0-9\-() .:—–'’é]{1,100}$/i;
const knownForm=/\b(mega|primal|origin|altered|attack|defense|speed|incarnate|therian|eternamax)\b/i;
const noSpecialForm=/\b(shadow|dynamax|gigantamax)\b/i;
function normalize(raw:string){
 const lower=raw.toLowerCase().replace(/é/g,'e').replace(/’/g,"'").trim().replace(/\s+[—–].*$/,'').replace(/\s*\([^)]*(hat|capelet|costume|bow|museum|event)[^)]*\)/g,'').replace(/\s*\((origin|altered|attack|defense|speed|incarnate|therian)\)/g,' $1').replace(/\s+/g,' ').trim();
 if(/^mega\s+/.test(lower)){
  const name=lower.slice(5).trim().replace(/\s+/g,'-');
  return {slug:name.replace(/-(x|y)$/,'')+'-mega'+(/-[xy]$/.test(name)?'-'+name.slice(-1):''),scope:'form'};
 }
 if(/^primal\s+/.test(lower))return {slug:lower.slice(7).replace(/\s+/g,'-')+'-primal',scope:'form'};
 if(/^eternamax\s+/.test(lower))return {slug:lower.slice(9).trim().replace(/\s+/g,'-')+'-eternamax',scope:'form'};
 const base=lower.replace(/^(shadow|dynamax|gigantamax)\s+/,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
 if(knownForm.test(lower)&&/-(origin|altered|attack|defense|speed|incarnate|therian)$/.test(base))return {slug:base,scope:'form'};
 return {slug:base,scope:'species'};
}
const unavailable=(message:string,status=503)=>NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:NextRequest){
 const raw=(request.nextUrl.searchParams.get('name')||'').trim();
 if(!allow.test(raw))return unavailable('Invalid Pokémon form or species name.',400);
 const {slug,scope}=normalize(raw);
 if(!/^[a-z0-9-]{1,70}$/.test(slug))return unavailable('The Pokémon species name cannot be verified.',400);
 try{
  const response=await fetch('https://pokeapi.co/api/v2/pokemon/'+encodeURIComponent(slug),{
   next:{revalidate:86400},signal:AbortSignal.timeout(5000)
  });
  if(!response.ok)return unavailable('Exact species/form typing is not available from the reference database. Choose the correct type manually in the guide.',404);
  const data=await response.json();
  const types=(Array.isArray(data.types)?data.types:[]).map((t:{type?:{name?:string}})=>t?.type?.name).filter((s:unknown):s is string=>typeof s==='string'&&s.length>0);
  if(!types.length||types.length>2)return unavailable('Species typing could not be validated.');
  return NextResponse.json({
   requested:raw,resolved:slug,types,scope,formVerified:scope==='form',
   typeSource:'PokéAPI species/form types (Pokémon GO uses the same type assignments)',
   noGoMovesets:true,notice:scope==='form'?'Exact form typing retrieved. Attack moves are not supplied by this endpoint.':'Species typing retrieved. Costume and Shadow variants retain the species typing; this is not a verified Pokémon GO moveset.'
  },{headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=86400'}});
 }catch{return unavailable('Type reference is temporarily unavailable. You can select the boss typing manually.');}
}
