import {NextRequest,NextResponse} from 'next/server';
export async function GET(req:NextRequest){
 const raw=(req.nextUrl.searchParams.get('name')||'').trim().toLowerCase();
 const aliases:Record<string,string>={
 'alolan grimer':'grimer-alola',
 'primal kyogre':'kyogre-primal',
 'primal groudon':'groudon-primal',
 'mega gengar':'gengar-mega',
 'mega sableye':'sableye-mega',
 'mega lucario':'lucario-mega',
 'mega garchomp':'garchomp-mega',
 'origin forme giratina':'giratina-origin',
 'alolan geodude':'geodude-alola',
 'alolan ninetales':'ninetales-alola',
 'alolan exeggutor':'exeggutor-alola',
 'alolan rattata':'rattata-alola',
 'alolan sandshrew':'sandshrew-alola',
 'alolan sandslash':'sandslash-alola',
 'alolan vulpix':'vulpix-alola',
 'darmanitan':'darmanitan-standard',
 'galarian darmanitan zen':'darmanitan-galar-zen',
 'galarian darmanitan (zen)':'darmanitan-galar-zen',
 'galarian weezing':'weezing-galar',
 'giratina origin':'giratina-origin',
 'mega charizard y':'charizard-mega-y',
 'mega charizard x':'charizard-mega-x',
 'mega rayquaza':'rayquaza-mega',
 'mega tyranitar':'tyranitar-mega',
 'mega gardevoir':'gardevoir-mega',
 'mega diancie':'diancie-mega',
 'galarian darmanitan':'darmanitan-galar-standard',
 'landorus':'landorus-incarnate',
 'landorus incarnate':'landorus-incarnate',
 'landorus (incarnate)':'landorus-incarnate',
 'tornadus':'tornadus-incarnate',
 'tornadus incarnate':'tornadus-incarnate',
 'thundurus':'thundurus-incarnate',
 'thundurus incarnate':'thundurus-incarnate',
 'enamorus':'enamorus-incarnate',
 'enamorus incarnate':'enamorus-incarnate'
};
 const name=aliases[raw]||raw.replace(/[^a-z0-9 -]/g,'').replaceAll(' ','-');
 if(!/^[a-z0-9-]{1,50}$/.test(name))return new NextResponse(null,{status:404});
 try{const r=await fetch('https://pokeapi.co/api/v2/pokemon/'+name,{next:{revalidate:86400}});if(!r.ok)return new NextResponse(null,{status:404});const j=await r.json();const url=j.sprites?.other?.['official-artwork']?.front_default||j.sprites?.front_default;if(!url||!url.startsWith('https://'))return new NextResponse(null,{status:404});return NextResponse.redirect(url,{status:307});}catch{return new NextResponse(null,{status:503})}
}
