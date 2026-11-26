export function eventRegion(e){
 if(String(e.region||'').toLowerCase()==='global'||!e.zone)return 'Global';
 const zones={'Asia/Tokyo':'Japan','Asia/Manila':'Philippines','Asia/Singapore':'Singapore','Asia/Hong_Kong':'Hong Kong','Asia/Bangkok':'Thailand','Asia/Jakarta':'Indonesia','America/Denver':'United States','America/Los_Angeles':'United States','America/Sao_Paulo':'Brazil','America/Argentina/Buenos_Aires':'Argentina','Europe/London':'United Kingdom','Asia/Seoul':'South Korea','Australia/Sydney':'Australia','America/Mexico_City':'Mexico'};
 return zones[e.zone]||'Other / location not classified';
}
export function eventInstant(date,time,zone){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time||'')||!zone)return null;
 const target=Date.parse(date+'T'+time+':00Z');if(!Number.isFinite(target)||new Date(target).toISOString().slice(0,10)!==date)return null;
 try{const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});const wall=t=>{const p=Object.fromEntries(fmt.formatToParts(t).map(x=>[x.type,x.value]));return Date.parse(p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute+':00Z')};let t=target;for(let i=0;i<4;i++)t+=target-wall(t);if(wall(t)!==target)return null;if(wall(t-3600000)===target||wall(t+3600000)===target)return null;return t}catch{return null}
}
export function eventClock(e,now,displayZone){
 const start=eventInstant(e.start,e.startTime,e.zone),end=eventInstant(e.end,e.endTime,e.zone);
 if(start===null||end===null||end<start)return null;
 try{const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:displayZone==='device'?undefined:displayZone,dateStyle:'medium',timeStyle:'short'});const remaining=now<start?start-now:now<end?end-now:0;return {start:fmt.format(start),end:fmt.format(end),state:now<start?'Starts in':now<end?'Ends in':'Ended',minutes:Math.ceil(remaining/60000)}}catch{return null}
}
