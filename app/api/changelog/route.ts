import {NextResponse} from 'next/server';
export const runtime='nodejs';export const revalidate=3600;
type Commit={sha:string;commit:{message:string;committer:{date:string}}};
function describe(message:string){
 const first=message.split('\n')[0].trim();
 const clean=first.replace(/^(feat|fix|content|docs|refactor|perf|test|chore)(\([^)]*\))?:\s*/i,'').replace(/^Phase (\d+)/i,'Phase $1');
 return clean.charAt(0).toUpperCase()+clean.slice(1);
}
export async function GET(){
 try{
  const response=await fetch('https://api.github.com/repos/AlfaMitsu/alfamitsu-pokemon-go-events/commits?sha=main&per_page=10',{headers:{Accept:'application/vnd.github+json','User-Agent':'AlfaMitsu-Website-Changelog'},next:{revalidate:3600}});
  if(!response.ok)throw Error('GitHub unavailable');
  const commits=await response.json() as Commit[];
  if(!Array.isArray(commits))throw Error('Invalid GitHub response');
  const entries=commits.filter(c=>c?.sha&&c?.commit?.message).slice(0,10).map(c=>({title:describe(c.commit.message)+' — '+new Date(c.commit.committer.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}),detail:'Published source update · commit '+c.sha.slice(0,8)+'. '+(c.commit.message.split('\n').slice(1).join(' ').trim().slice(0,350)||'See the GitHub commit for the exact files changed.'),url:'https://github.com/AlfaMitsu/alfamitsu-pokemon-go-events/commit/'+c.sha}));
  return NextResponse.json({entries,source:'github',note:'Tracks repository commits; poster designs made outside the repository require a separate import.'},{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400'}});
 }catch{return NextResponse.json({entries:[],source:'fallback',note:'Live GitHub history temporarily unavailable.'},{headers:{'Cache-Control':'public, s-maxage=300'}})}
}
