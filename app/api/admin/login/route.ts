import {NextRequest,NextResponse} from 'next/server';
import {ADMIN_COOKIE,adminConfigured,checkAdminPassword,issueAdminSession,sameOrigin} from '@/lib/admin-auth';
export const runtime='nodejs';
export async function POST(request:NextRequest){
  if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers:{'Cache-Control':'no-store'}});
  if(!adminConfigured())return NextResponse.json({error:'Owner login has not been configured.'},{status:503,headers:{'Cache-Control':'no-store'}});
  let submitted:unknown;
  try{submitted=(await request.json())?.password;}catch{return NextResponse.json({error:'Invalid request.'},{status:400,headers:{'Cache-Control':'no-store'}});}
  if(!checkAdminPassword(submitted))return NextResponse.json({error:'Incorrect access password.'},{status:401,headers:{'Cache-Control':'no-store'}});
  const session=issueAdminSession();
  const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  response.cookies.set(ADMIN_COOKIE,session.value,{path:'/',httpOnly:true,secure:true,sameSite:'strict',maxAge:session.maxAge});
  return response;
}
