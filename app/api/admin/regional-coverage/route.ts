import {NextRequest,NextResponse} from 'next/server';
import events from '@/lib/events.json';
import {ADMIN_COOKIE,verifyAdminSession} from '@/lib/admin-auth';
import {regionalCoverage} from '@/lib/regional-coverage.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
 if(!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({error:'Unauthorized'},{status:401,headers});
 const today=new Date();const weekday=(today.getUTCDay()+6)%7;const monday=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()-weekday));
 const date=(offset:number)=>new Date(monday.getTime()+offset*86400000).toISOString().slice(0,10);
 const from=request.nextUrl.searchParams.get('from')||date(0);const through=request.nextUrl.searchParams.get('through')||date(6);
 try{const days=(Date.parse(through)-Date.parse(from))/86400000;if(days>90)throw Error('Window must be at most 90 days');return NextResponse.json({checkedAt:new Date().toISOString(),...regionalCoverage(events,from,through),note:'Based on currently published records; absence of regional events does not mean no local events exist.'},{headers})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid date range'},{status:400,headers})}
}
