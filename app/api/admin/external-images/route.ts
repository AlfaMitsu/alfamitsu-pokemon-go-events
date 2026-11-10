import {NextRequest,NextResponse} from 'next/server';
import events from '@/lib/events.json';
import {ADMIN_COOKIE,verifyAdminSession} from '@/lib/admin-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
// Only scan repository-controlled image references from explicitly allowed public CDN hosts.
const allowedHosts=new Set(['pbs.twimg.com','media.pocketgamer.com']);
export async function GET(request:NextRequest){
  if(!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))
    return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'private, no-store'}});
  const targets=new Map<string,string[]>();
  for(const event of events){
    const candidates=[event.poster,event.onlineImage,...(event.additionalPosters||[]).map(x=>x.src)];
    for(const source of candidates){
      if(!source||!source.startsWith('https://'))continue;
      try{
        const parsed=new URL(source);
        if(parsed.protocol!=='https:'||!allowedHosts.has(parsed.hostname))continue;
        targets.set(source,[...(targets.get(source)||[]),event.id]);
      }catch{}
    }
  }
  const checks=await Promise.all([...targets.entries()].slice(0,20).map(async ([url,eventIds])=>{
    let status:'available'|'unavailable'|'manual-review'='manual-review';
    let httpStatus:number|null=null;
    let note='Unable to confirm this image automatically.';
    try{
      const response=await fetch(url,{method:'HEAD',redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(2800)});
      httpStatus=response.status;
      const imageType=(response.headers.get('content-type')||'').toLowerCase();
      if(response.ok&&imageType.startsWith('image/')){status='available';note='Image endpoint responded successfully.';}
      else if(response.status===404||response.status===410){status='unavailable';note='Remote server reports that this poster is not available.';}
      else{note='Status or content type is inconclusive; verify manually. Some image hosts block HEAD requests.';}
    }catch{note='Request timed out or remote host could not be reached; do not assume the image is broken.';}
    return {url,eventIds:[...new Set(eventIds)],status,httpStatus,note};
  }));
  return NextResponse.json({checkedAt:new Date().toISOString(),checks},{headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
}
