import fs from 'node:fs';
import path from 'node:path';
const events=JSON.parse(fs.readFileSync('lib/events.json','utf8'));
const ids=new Set();let errors=[];let generated=0,local=0;
const available=(src)=>src.startsWith('/posters/')?fs.existsSync(path.join('public',src.slice(1))):src.startsWith('/api/event-poster?id=');
for(const e of events){
 if(!e.id||ids.has(e.id))errors.push('Duplicate or missing event ID '+e.id);
 ids.add(e.id);
 if(!e.name)errors.push('Missing event name '+e.id);
 if(Boolean(e.start)!==Boolean(e.end))errors.push('Partially specified date '+e.id);
 if(e.start&&e.end&&e.start>e.end)errors.push('Reversed dates '+e.id);
 if(e.poster?.startsWith('/')){
  if(!available(e.poster))errors.push('Missing or unsupported event poster '+e.id+': '+e.poster);
  else if(e.poster.startsWith('/api/'))generated++;else local++;
 }
 for(const ext of e.additionalPosters||[])if(ext.src?.startsWith('/posters/')&&!available(ext.src))errors.push('Missing supplementary image '+e.id+': '+ext.src);
}
for(const e of events)if(e.linkedEventId&&!ids.has(e.linkedEventId))errors.push('Broken linked event '+e.id+' -> '+e.linkedEventId);
console.log('Event audit: '+events.length+' entries, '+local+' local posters, '+generated+' generated posters, '+errors.length+' errors');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
