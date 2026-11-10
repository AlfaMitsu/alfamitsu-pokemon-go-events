import {NextRequest,NextResponse} from 'next/server';
import {ADMIN_COOKIE,sameOrigin} from '@/lib/admin-auth';
export const runtime='nodejs';
export async function POST(request:NextRequest){
  if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers:{'Cache-Control':'no-store'}});
  const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  response.cookies.set(ADMIN_COOKIE,'',{path:'/',maxAge:0,httpOnly:true,secure:true,sameSite:'strict'});
  return response;
}
