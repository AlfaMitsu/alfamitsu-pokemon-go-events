from pathlib import Path
import json
base=Path('/mnt/data/work-wild-raid')
p=base/'lib/events.json'; events=json.loads(p.read_text()); known={e['id'] for e in events}
src_itw='https://pokemongo.com/news/into-the-wild-2026';src_global='https://pokemongo.com/gowildarea/global'
new=[]
def add(slug,start,end,title,pokemon,category,detail,source,startTime,endTime):
 id='event-battles-'+slug
 if id in known:return
 new.append(dict(id=id,start=start,end=end,name=title,detail=detail,zone='',startTime=startTime,endTime=endTime,posterType='custom',category=category,featuredPokemon=pokemon,source=source,linkedEventId='ev025' if source==src_itw else 'ev027'))
add('itw-five-star','2026-11-09','2026-11-13','Into the Wild • 5★ Raids',['Zacian','Zamazenta'],'raid','Five-star raids: Crowned Sword Zacian and Crowned Shield Zamazenta. Earn the corresponding Crowned Sword or Crowned Shield Energy.',src_itw,'10:00','20:00')
add('itw-three-star','2026-11-09','2026-11-13','Into the Wild • 3★ Raids',['Druddigon','Orthworm'],'raid','Three-star raids: Druddigon and Orthworm.',src_itw,'10:00','20:00')
add('itw-zacian-raid-hour','2026-11-09','2026-11-09','Crowned Sword Zacian Raid Hour',['Zacian'],'raid','Into the Wild Raid Hour: Crowned Sword Zacian, 6:00–7:00 p.m. local time.',src_itw,'18:00','19:00')
add('itw-zamazenta-raid-hour','2026-11-10','2026-11-10','Crowned Shield Zamazenta Raid Hour',['Zamazenta'],'raid','Into the Wild Raid Hour: Crowned Shield Zamazenta, 6:00–7:00 p.m. local time.',src_itw,'18:00','19:00')
add('itw-one-two-star-max','2026-11-09','2026-11-13','Into the Wild • 1★–2★ Max Battles',['Ralts','Machop'],'max-battle-rotation','Featured Max Battles: one-star Ralts and two-star Machop.',src_itw,'10:00','20:00')
for day,slug,name,mons in [('2026-11-11','registeel','Registeel',['Registeel']),('2026-11-12','regidrago','Regidrago',['Regidrago']),('2026-11-13','latias-latios','Latias & Latios',['Latias','Latios'])]:
 add('itw-max-'+slug,day,day,'Into the Wild • Dynamax '+name,mons,'max-battle-rotation',f'Five-star Max Battles featuring Dynamax {name}. Featured Max Battle hour 6:00–7:00 p.m. local time.',src_itw,'18:00','19:00')
add('wild-sat-five','2026-11-14','2026-11-14','GO Wild Area • Saturday 5★ Raids',['Zekrom','Kyurem'],'raid','Saturday five-star raids: Zekrom and White Kyurem. White Kyurem rewards Fusion Energy.',src_global,'10:00','18:00')
add('wild-sun-five','2026-11-15','2026-11-15','GO Wild Area • Sunday 5★ Raids',['Reshiram','Kyurem'],'raid','Sunday five-star raids: Reshiram and Black Kyurem. Black Kyurem rewards Fusion Energy.',src_global,'10:00','18:00')
add('wild-three','2026-11-14','2026-11-15','GO Wild Area • 3★ Raids',['Machamp'],'raid','Three-star raids: Machamp wearing a modern jacket. Available during event hours on both days.',src_global,'10:00','18:00')
add('wild-sat-max','2026-11-14','2026-11-14','GO Wild Area • Saturday Max Battles',['Dialga','Duraludon'],'max-battle-rotation','Dynamax Dialga and six-star Gigantamax Duraludon Max Battles on Saturday.',src_global,'10:00','18:00')
add('wild-sun-max','2026-11-15','2026-11-15','GO Wild Area • Sunday Max Battles',['Palkia','Duraludon'],'max-battle-rotation','Dynamax Palkia and six-star Gigantamax Duraludon Max Battles on Sunday.',src_global,'10:00','18:00')
# Keep event as a full event entry; add just featured battle entries.
events.extend(new);p.write_text(json.dumps(events,ensure_ascii=False,indent=2)+'\n')
print('added',len(new),'total',len(events))
q=base/'app/page.tsx';code=q.read_text()
code=code.replace('category?:\'raid\'|\'max-battle-rotation\'|\'event\';detail?',"category?:'raid'|'max-battle-rotation'|'event';featuredPokemon?:string[];linkedEventId?:string;detail?")
# Image-backed species previews in all calendar cards when a grouped battle entry is present.
old='{src&&<img loading="lazy" src={src} alt={ev.name} onError={err=>posterFallback(err,ev)} className="absolute inset-0 h-full w-full object-cover object-center opacity-90 transition group-hover:scale-[1.03]"/>}'
new='''{ev.featuredPokemon?.length?<div className="absolute inset-0 flex items-center justify-evenly gap-1 bg-gradient-to-r from-[#0e3161] via-[#132951] to-[#271b55] px-2 pb-8">{ev.featuredPokemon.map(mon=><SpriteImage key={mon} name={mon} className="h-16 min-w-0 max-w-[44%] flex-1 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,.65)]"/>)}</div>:src&&<img loading="lazy" src={src} alt={ev.name} onError={err=>posterFallback(err,ev)} className="absolute inset-0 h-full w-full object-cover object-center opacity-90 transition group-hover:scale-[1.03]"/>}'''
assert old in code;code=code.replace(old,new)
# Add matching art and navigation in detail when event is a battle group
old='<h2 className="text-lg font-bold">Event details</h2><p>{selected.detail'
new='<h2 className="text-lg font-bold">Event details</h2>{selected.featuredPokemon?.length&&<div className="flex flex-wrap gap-2">{selected.featuredPokemon.map(mon=><div key={mon} className="w-28"><PokemonPic name={mon} small/></div>)}</div>}<p>{selected.detail'
assert old in code;code=code.replace(old,new)
old="{title:'Weekly calendar navigation and timing improvements — 4 Nov 2026'"
new="{title:'Featured event raids and Max Battles — 8 Nov 2026',detail:'Into the Wild and GO Wild Area Global remain in Events, while their verified 3-star and 5-star raid lineups, timed Raid Hours and separate Max Battle rotations now appear in their own weekly calendar sections with boss previews and source links.'},\n     {title:'Weekly calendar navigation and timing improvements — 4 Nov 2026'"
assert old in code;code=code.replace(old,new)
q.write_text(code)
(base/'README_EVENT_BATTLES_2026_11_08.md').write_text('''# Event-linked raid and Max Battle schedules (8 November 2026)\n\nThe main **Into the Wild** and **GO Wild Area Global** entries remain in the Events row. Separate battle entries have `category: "raid"` or `category: "max-battle-rotation"`, a `linkedEventId` to the parent event, and `featuredPokemon` images.\n\n- Into the Wild: 5-star Crowned Sword Zacian and Crowned Shield Zamazenta; 3-star Druddigon and Orthworm; Zacian Monday and Zamazenta Tuesday 6–7 p.m. raid hours. Featured Max Battles include Ralts, Machop, and scheduled Registeel / Regidrago / Latias & Latios.\n- GO Wild Area Global: Saturday 5-star Zekrom and White Kyurem; Sunday 5-star Reshiram and Black Kyurem; costumed Machamp 3-star both days. Saturday Dynamax Dialga / Gigantamax Duraludon and Sunday Dynamax Palkia / Gigantamax Duraludon Max Battles.\n- Time windows are local to the player. All original event posters and other records are preserved.\n- Sources: https://pokemongo.com/news/into-the-wild-2026 and https://pokemongo.com/gowildarea/global\n\nThese added battle-group cards do not represent independent new festivals, and the underlying main event is not duplicated. Clone Special Raid Day remains excluded.\n''')
