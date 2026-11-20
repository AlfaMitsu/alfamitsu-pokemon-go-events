import fs from 'node:fs';
import {discoverLinks,compareDiscovery,OFFICIAL_NEWS} from '../lib/event-discovery.mjs';
const token=process.env.GITHUB_TOKEN,repo=process.env.GITHUB_REPOSITORY;
if(!token||!/^[-\w]+\/[-\w.]+$/.test(repo||''))throw Error('GitHub Actions credentials required');
const api='https://api.github.com/repos/'+repo;
const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','User-Agent':'AlfaMitsu-Event-Discovery'};
async function gh(path,options={}){const r=await fetch(api+path,{...options,headers:{...headers,...options.headers}});if(!r.ok)throw Error('GitHub '+r.status+' '+path);return r.json()}
const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
let html;try{const r=await fetch(OFFICIAL_NEWS,{signal:controller.signal,headers:{'User-Agent':'AlfaMitsuEventMonitor/1.0'}});if(!r.ok)throw Error('Official news unavailable '+r.status);html=await r.text()}finally{clearTimeout(timer)}
const events=JSON.parse(fs.readFileSync('lib/events.json','utf8'));
const candidates=compareDiscovery(discoverLinks(html),events).filter(x=>x.match==='review-new-source').slice(0,12);
const existing=await gh('/issues?state=open&labels=event-discovery&per_page=100');
let created=0;
for(const item of candidates){if(existing.some(issue=>issue.body?.includes('Official URL: '+item.url)))continue;
 const body='Official URL: '+item.url+'\n\nHeadline: '+item.title+'\n\nOwner review required. Confirm event dates, times, region, and bonuses from the official source. This discovery does not auto-publish or infer dates.\n\nTo publish: create an issue with the \`event-approved\` label and a fenced JSON code block containing a validated event proposal. Only trusted repository maintainers should apply that label.';
 await gh('/issues',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Event discovery: '+item.title.slice(0,90),body,labels:['event-discovery']})});created++;
}
console.log(JSON.stringify({officialLinks:discoverLinks(html).length,newCandidates:candidates.length,created,checkedAt:new Date().toISOString()}));
