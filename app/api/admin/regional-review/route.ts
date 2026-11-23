import {NextRequest,NextResponse} from 'next/server';
import events from '@/lib/events.json';
import {ADMIN_COOKIE,verifyAdminSession} from '@/lib/admin-auth';
import {regionalReview} from '@/lib/regional-review.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
 if(!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({error:'Unauthorized'},{status:401,headers});
 const from=request.nextUrl.searchParams.get('from')||new Date().toISOString().slice(0,10),through=request.nextUrl.searchParams.get('through')||from;
 try{if((Date.parse(through)-Date.parse(from))/86400000>90)throw Error('Window must be at most 90 days');return NextResponse.json(regionalReview(events,from,through),{headers})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid range'},{status:400,headers})}
}
