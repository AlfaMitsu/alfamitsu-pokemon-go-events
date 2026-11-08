import {lookupSpecies} from '@/lib/pokemon-images';
import speciesIds from '@/lib/pokemon-species-ids.json';
import { ImageResponse } from 'next/og';
import events from '../../../lib/events.json';

export const runtime = 'nodejs';

const dex: Record<string,number> = {
  blacephalon:806,genesect:649,thundurus:642,tornadus:641,cresselia:488,blaziken:257,sceptile:254,ampharos:181,
  dialga:483,palkia:484,solgaleo:791,lunala:792,pidgeot:18,sableye:302,absol:359,articuno:144,zapdos:145,
  moltres:146,zacian:888,zamazenta:889,regieleki:894,pinsir:127,steelix:208,slowbro:80,houndoom:229,latias:380,
  regidrago:895,kyogre:382,groudon:383,manectric:310,aerodactyl:142,alakazam:65,sharpedo:319,banette:354,
  latios:381,nihilego:793,pheromosa:795,buzzwole:794,xurkitree:796,camerupt:323,glalie:362,altaria:334,
  medicham:308,reshiram:643,zekrom:644,necrozma:800,kartana:798,celesteela:797,audino:531,lopunny:428,
  scizor:212,lucario:448,salamence:373,aggron:306,uxie:480,mesprit:481,azelf:482,regirock:377,regice:378,
  registeel:379,garchomp:445,swampert:260,gyarados:130,beedrill:15,venusaur:3,malamar:687,victreebel:71,
  xerneas:716,yveltal:717,blastoise:9,dragonite:149,giratina:487,charizard:6,landorus:645,drampa:780,
  caterpie:10,beldum:374,roggenrola:524,wailmer:320,growlithe:58,machop:66,chansey:113,rookidee:821,
  falinks:870,hawlucha:701,pikachu:25,woobat:527,trapinch:328,drilbur:529,shuckle:213,cottonee:546,combee:415,
  inkay:686,electabuzz:125,hoothoot:163,pidove:519,trubbish:568,feebas:349,magmar:126,magikarp:129,
  hitmontop:237,ralts:280,rhyhorn:111,sobble:816,sizzlipede:850,sneasel:215,piplup:393,grookey:810,
  scorbunny:813,tinkatink:957,lechonk:915,deino:633,frigibax:996,nickit:827,gible:443,zorua:570,
  klawf:950,flamigo:973,oricorio:741,ditto:132,blipbug:824,riolu:447,silicobra:843,orthworm:968,
  flittle:955,corviknight:823,snom:872,magby:240,smoochum:238,starmie:121,mewtwo:150,maschiff:942,
  phantump:708,applin:840,bramblin:946,sandile:551,minior:774,fidough:926,eevee:133,glimmet:969,
  butterfree:12,lapras:131,rayquaza:384,clefairy:35, "tapu koko":785, "tapu lele":786, "tapu bulu":787,
  "tapu fini":788, clefable:36, gardevoir:282, durant:632, duraludon:884, druddigon:621,
  eternatus:890, cinderace:815, rillaboom:812, machamp:68, "ho-oh":250, luxray:405
};

const highlightRules: Array<[string,string[]]> = [
  ['pinch perfect',['Klawf']],['high zaptitude',['Fidough']],['precious pals',['Eevee']],
  ['into the depths',['Glimmet']],['carnival of flamigo',['Flamigo']],['pokopia',['Ditto']],
  ['bug out',['Blipbug']],['sustainability',['Silicobra']],['steeled resolve',['Orthworm']],
  ['spring marathon',['Flittle']],['flying taxi',['Corviknight']],['arctic embers',['Snom']],
  ['fire and ice',['Magby','Smoochum']],['water festival',['Starmie']],
  ['mega ascension',['Mewtwo']],['mega finale',['Mewtwo']],['mega squads',['Maschiff']],
  ['horizons',['Pikachu','Charizard']],['harvest festival',['Applin']],
  ['world space week',['Pikachu']],['fall marathon',['Bramblin']],
  ['orionids',['Minior']],['ozone ascent',['Rayquaza']],
  ['fashion raid day',['Dragonite','Butterfree']],['go bigger',['Charizard','Venusaur']],
  ['go fest',['Mewtwo','Pikachu']],['community day',['Pikachu']],
  ['30th anniversary',['Pikachu']],['anniversary',['Pikachu']]
];


function pokemonName(value: string) {
 const clean=value.replace(/^(dynamax|gigantamax|shadow|mega)\s+/i,'')
  .replace(/\s+(x|y|z)$/i,'').replace(/\s+\(.*\)$/,'').trim().toLowerCase();
 const match=lookupSpecies(value);
 if(match)return clean in dex?clean:Object.keys(speciesIds).find(n=>speciesIds[n]===match)||clean;
 if(/pikachu/i.test(value))return 'pikachu';
 return clean;
}

function highlights(e: any): string[] {
 if(e.featuredPokemon?.length)return e.featuredPokemon.slice(0,3);
 const value=String(e.name||'').toLowerCase();
 for(const [part,names] of highlightRules)if(value.includes(part))return names;
 const names=Object.keys(dex).filter(n=>n.length>3&&value.includes(n)).sort((a,b)=>b.length-a.length);
 return names.length?names.slice(0,3).map(s=>s.replace(/(^|\s)\S/g,c=>c.toUpperCase())):[];
}

async function getImageData(url:string):Promise<string|null>{
 try{
  const res=await fetch(url,{next:{revalidate:604800},signal:AbortSignal.timeout(4000)});
  if(!res.ok)return null;
  const mime=(res.headers.get('content-type')||'').split(';')[0].trim();
  if(!['image/png','image/jpeg','image/webp'].includes(mime))return null;
  const bytes=await res.arrayBuffer();
  if(!bytes.byteLength||bytes.byteLength>2500000)return null;
  return 'data:'+mime+';base64,'+Buffer.from(bytes).toString('base64');
 }catch{return null}
}

async function singaporePikachu():Promise<string|null>{
 // Dittobase hosts an individual Pokédex entry with the real Singapore-specific
 // blue costume. Extract the matching image, not a different regional Pikachu.
 try{
  const page=await fetch('https://www.dittobase.com/pokemon-go/pokedex/pikachu-anniversary-2026-singapore-01',{
    next:{revalidate:86400},signal:AbortSignal.timeout(4500),headers:{'User-Agent':'Mozilla/5.0 AlfaMitsuEventTracker/1.0'}
  });
  if(!page.ok)return null;
  const html=await page.text();
  const alt=/<img\b[^>]*alt=["']Blue Pok(?:é|e)Xciting! Pikachu["'][^>]*>/gi;
  const tags=[...html.matchAll(alt)].map(m=>m[0]);
  for(const tag of tags.slice(0,6)){
   const m=tag.match(/\bsrc=["']([^"']+)["']/i);
   if(!m)continue;
   const raw=m[1].replace(/&amp;/g,'&');
   const url=new URL(raw,'https://www.dittobase.com').href;
   if(!url.startsWith('https://www.dittobase.com/')&&!url.startsWith('https://images.dittobase.com/'))continue;
   const img=await getImageData(url);
   if(img)return img;
  }
  return null;
 }catch{return null}
}

async function spriteData(name:string):Promise<string|null>{
 const lower=name.toLowerCase().trim();
 if(/(?:blue|singapore).*(?:poke.?xciting|afro).*pikachu|blue\s+pok[eé]xciting.*pikachu/i.test(lower)){
  const costume=await singaporePikachu();
  if(costume)return costume;
 }
 // Get authentic GO form imagery by exact name when the named variant is known.
 const special:Record<string,string>={
  'crowned sword zacian':'pm888.fCROWNED_SWORD.icon.png',
  'crowned shield zamazenta':'pm889.fCROWNED_SHIELD.icon.png',
  'gigantamax charizard':'pm6.fGIGANTAMAX.icon.png',
  'gigantamax venusaur':'pm3.fGIGANTAMAX.icon.png',
  'gigantamax blastoise':'pm9.fGIGANTAMAX.icon.png',
  'gigantamax machamp':'pm68.fGIGANTAMAX.icon.png',
  'pikachu wearing a kurta':'pm25.fKURTA.icon.png'
 };
 const exact=special[lower];
 if(exact){
  const url='https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/'+exact;
  const img=await getImageData(url);if(img)return img;
 }
 const clean=pokemonName(name);
 const id=dex[clean]||lookupSpecies(name)||lookupSpecies(clean);
 if(!id)return null;
 for(const suffix of ['other/official-artwork/','other/home/','']){
  const url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+suffix+id+'.png';
  const result=await getImageData(url);if(result)return result;
 }
 const go='https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/pm'+id+'.icon.png';
 return getImageData(go);
}

export async function GET(request: Request) {
  const id=new URL(request.url).searchParams.get('id') || '';
  const e=(events as any[]).find(item=>item.id===id);
  if (!e) return new Response('Poster event not found',{status:404});
  const isRaid=e.category==='raid';
  const isMax=e.category==='max-battle-rotation';
  const isUnconfirmed=e.confirmation==='unconfirmed'||/unconfirmed|datamine/i.test(e.name);
  const category=isRaid?'RAID BATTLES':isMax?'MAX BATTLES':isUnconfirmed?'UNCONFIRMED EVENT':/community day/i.test(e.name)?'COMMUNITY DAY':'POKÉMON GO EVENT';
  const theme=isRaid?['#25143e','#ef92ff','#62358d']:isMax?['#063e42','#66f4c4','#17666e']:isUnconfirmed?['#492e12','#ffe094','#755120']:['#0d3159','#8ae3ff','#18567c'];
  const mons=highlights(e);
  const artwork=await Promise.all(mons.map(async name=>({name,src:await spriteData(name)})));
  const title=String(e.name).replace(/\s*\(Unconfirmed\)$/i,'');
  const dates=e.start===e.end?e.start:e.start+'  –  '+e.end;
  const label=artwork.length?'FEATURED POKÉMON':'EVENT HIGHLIGHT';
  const color=theme[1];

  return new ImageResponse(
    <div style={{display:'flex',flexDirection:'column',width:'100%',height:'100%',padding:42,background:'linear-gradient(140deg,'+theme[2]+' 0%,'+theme[0]+' 56%,#051020 100%)',fontFamily:'sans-serif',color:'#fff',position:'relative'}}>
      <div style={{display:'flex',flexDirection:'column',width:'100%',height:'100%',border:'5px solid '+color,borderRadius:30,padding:32,background:'rgba(3,12,32,0.28)'}}>
        <div style={{display:'flex',alignItems:'center',background:'#06192c',padding:'16px 20px',borderRadius:14,color,fontSize:26,fontWeight:800,letterSpacing:1}}>
          ALFAMITSU SERVICES  •  {category}
        </div>
        <div style={{display:'flex',minHeight:165,alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:title.length>83?36:title.length>55?44:53,fontWeight:900,lineHeight:1.12,padding:'18px 5px'}}>
          {title}
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',flex:1,position:'relative',background:'radial-gradient(ellipse at center, rgba(255,255,255,0.12), rgba(0,0,0,0.05))',borderRadius:30,border:'3px solid '+color+'55'}}>
          {artwork.length?
           <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',gap:4,padding:12}}>
            {artwork.map((mon,i)=>(
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:artwork.length===1?'86%':artwork.length===2?'49%':'32%',minHeight:300}}>
                {mon.src?<img src={mon.src} width={artwork.length===1?410:artwork.length===2?305:225} height={artwork.length===1?410:artwork.length===2?305:225} style={{objectFit:'contain'}} alt={mon.name}/>:
                 <div style={{display:'flex',width:210,height:210,borderRadius:110,alignItems:'center',justifyContent:'center',border:'12px solid '+color,background:'#13243b',fontSize:80}}>◉</div>}
                <div style={{display:'flex',background:'#06152b',border:'2px solid '+color,borderRadius:12,padding:'12px 16px',fontWeight:800,fontSize:artwork.length===1?28:21,textAlign:'center',justifyContent:'center',maxWidth:'100%'}}>{mon.name}</div>
              </div>
            ))}
           </div>:
           <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:26}}>
             <div style={{display:'flex',width:290,height:290,borderRadius:165,border:'20px solid '+color,background:'#072b47',alignItems:'center',justifyContent:'center',fontSize:145,color}}>◉</div>
             <div style={{display:'flex',fontSize:31,fontWeight:800,color,textAlign:'center'}}>{label}</div>
           </div>}
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,background:'#08182e',border:'3px solid '+color,borderRadius:20,padding:23,marginTop:23}}>
          <div style={{display:'flex',fontWeight:900,fontSize:34,color}}>{dates}</div>
          <div style={{display:'flex',fontSize:23,color:'#d5ecff'}}>{isUnconfirmed?'UNCONFIRMED • CONCEPT ART':'Feature art based on listed event encounters'}</div>
        </div>
      </div>
    </div>,
    {width:1000,height:1250,headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800'}}
  );
}
