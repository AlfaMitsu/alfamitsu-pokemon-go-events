import {NextRequest,NextResponse} from 'next/server';
import events from '@/lib/events.json';
import posters from '@/lib/posters.json';
import {ADMIN_COOKIE,verifyAdminSession} from '@/lib/admin-auth';
import {posterReview} from '@/lib/poster-review.mjs';
import fs from 'node:fs';
import path from 'node:path';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
 if(!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({error:'Unauthorized'},{status:401,headers});
 let assets:string[]=[];
 try{assets=fs.readdirSync(path.join(process.cwd(),'public','posters')).filter(p=>/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(p)).map(p=>'/posters/'+p)}catch{}
 return NextResponse.json({...posterReview(events,posters,assets),inventoryAvailable:assets.length>0},{headers});
}
