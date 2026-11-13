import fs from 'node:fs';
import {monitorInventory,checkRemoteImages} from '../lib/event-monitor.mjs';
const events=JSON.parse(fs.readFileSync('lib/events.json','utf8'));
const inventory=monitorInventory(events);
const checks=await checkRemoteImages(inventory.remoteImages,{limit:20,timeout:3000});
const missing=checks.filter(x=>x.status==='unavailable');
const summary={checkedAt:new Date().toISOString(),events:inventory.events,current:inventory.current,upcoming:inventory.upcoming,findings:inventory.issues.length,imagesChecked:checks.length,missingImages:missing.length};
console.log(JSON.stringify(summary));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## AlfaMitsu event monitor\n\n'+Object.entries(summary).map(([k,v])=>'- **'+k+'**: '+v).join('\n')+'\n\n'+missing.map(x=>'- Missing: '+x.url+' ('+x.eventIds.join(', ')+')').join('\n')+'\n');
if(missing.length||inventory.issues.some(x=>x.code==='NO_FUTURE_EVENTS')){console.error('Monitoring requires owner review.');process.exitCode=1}
