import {NextRequest,NextResponse} from 'next/server';
import events from '@/lib/events.json';
import {ADMIN_COOKIE,verifyAdminSession} from '@/lib/admin-auth';
import {monitorInventory,checkRemoteImages} from '@/lib/event-monitor.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 if(!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'private, no-store'}});
 const inventory=monitorInventory(events);
 const remote=request.nextUrl.searchParams.get('remote')==='1'?await checkRemoteImages(inventory.remoteImages,{limit:20}):[];
 return NextResponse.json({...inventory,checkedAt:new Date().toISOString(),remoteChecked:remote.length>0,remote},{headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
}
