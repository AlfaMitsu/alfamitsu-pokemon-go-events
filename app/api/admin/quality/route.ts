import {NextRequest,NextResponse} from 'next/server';
import {existsSync} from 'node:fs';
import path from 'node:path';
import events from '@/lib/events.json';
import posterMap from '@/lib/posters.json';
import {ADMIN_COOKIE,verifyAdminSession} from '@/lib/admin-auth';
import {runQualityAudit} from '@/lib/quality-core.mjs';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
  if(!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))
    return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'private, no-store'}});
  const result=runQualityAudit(events,posterMap,(asset:string)=>{
    if(!/^\/posters\/[a-z\d][a-z\d/_ .()@+-]*\.(png|jpe?g|webp|gif|svg|avif)$/i.test(asset))return false;
    return existsSync(path.join(process.cwd(),'public',asset.slice(1)));
  });
  return NextResponse.json({...result,checkedAt:new Date().toISOString(),externalUrlsChecked:false},{headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
}
