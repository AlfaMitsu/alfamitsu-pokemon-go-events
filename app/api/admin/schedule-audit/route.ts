import {NextRequest,NextResponse} from 'next/server';
import events from '@/lib/events.json';
import {ADMIN_COOKIE,verifyAdminSession} from '@/lib/admin-auth';
import {auditSchedule} from '@/lib/smart-event-v10.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 if(!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'private, no-store'}});
 const today=new Date().toISOString().slice(0,10);const findings=auditSchedule(events,today);
 return NextResponse.json({checkedAt:new Date().toISOString(),findings,requiresOwnerApproval:true,autoPublished:false,note:'Review against official event sources before editing the GitHub schedule. Official news-link discovery and GitHub-approved publishing are configured; this audit itself does not publish.'},{headers:{'Cache-Control':'private, no-store'}});
}
