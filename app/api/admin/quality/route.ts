import {NextRequest,NextResponse} from 'next/server';
import qualityReport from '@/lib/quality-report.json';
import {ADMIN_COOKIE,verifyAdminSession} from '@/lib/admin-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
  if(!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))
    return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'private, no-store'}});
  return NextResponse.json(qualityReport,{headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
}
