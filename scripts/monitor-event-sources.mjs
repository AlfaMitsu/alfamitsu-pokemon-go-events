import fs from 'node:fs';
import {activeSources,articleFingerprint,compareFingerprint} from '../lib/source-monitor.mjs';
const repo=process.env.GITHUB_REPOSITORY,token=process.env.GITHUB_TOKEN;
if(!token||!/^[-\w]+\/[-\w.]+$/.test(repo||''))throw Error('GitHub credentials required');
const api='https://api.github.com/repos/'+repo;
const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','User-Agent':'AlfaMitsu-Source-Monitor','Content-Type':'application/json'};
async function gh(path,options={}){const r=await fetch(api+path,{...options,headers,signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('GitHub '+r.status+' '+path);return r.json()}
const label='event-source-monitor';
const response=await fetch(api+'/labels',{method:'POST',headers,body:JSON.stringify({name:label,color:'fbca04',description:'Official event source fingerprints and change review'})});
if(!response.ok&&response.status!==422)throw Error('Label setup failed');
const issues=await gh('/issues?state=open&labels='+label+'&per_page=100');
const events=JSON.parse(fs.readFileSync('lib/events.json','utf8'));
const sources=activeSources(events,new Date().toISOString().slice(0,10));
const counts={baseline:0,unchanged:0,'review-change':0,unavailable:0};
for(const {url,ids} of sources){
 let hash=null;
 try{const r=await fetch(url,{signal:AbortSignal.timeout(8000),redirect:'error'});if(r.ok)hash=articleFingerprint(await r.text())}catch{}
 const issue=issues.find(i=>i.body?.includes('Source: '+url+'\n'));
 const previous=issue?.body?.match(/Fingerprint: ([a-f0-9]{64})/)?.[1];
 const state=compareFingerprint(previous,hash);counts[state]++;
 if(state==='unavailable'||state==='unchanged')continue;
 const body='Source: '+url+'\nFingerprint: '+hash+'\nEvent IDs: '+ids.join(', ')+'\n\n'+(state==='baseline'?'Baseline recorded.':'Source content changed. Owner must review dates, bonuses, cancellation or rescheduling before editing. No automatic event changes.');
 if(issue){await gh('/issues/'+issue.number+'/comments',{method:'POST',body:JSON.stringify({body:'Source fingerprint changed. Review '+url+' before publishing any edits.'})});await gh('/issues/'+issue.number,{method:'PATCH',body:JSON.stringify({body})})}
 else await gh('/issues',{method:'POST',body:JSON.stringify({title:'Event source monitor: '+ids[0],body,labels:[label]})});
}
console.log(JSON.stringify(counts));
