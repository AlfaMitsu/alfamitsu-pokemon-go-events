import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';

export const ADMIN_COOKIE='ams_admin_session';
const SESSION_MILLIS=8*60*60*1000;
const expectedHash=()=>process.env.ALFAMITSU_ADMIN_PASSWORD_SHA256||'';
const signingKey=()=>process.env.ALFAMITSU_ADMIN_SESSION_SECRET||'';

export function adminConfigured(){
  return /^[a-f0-9]{64}$/i.test(expectedHash()) && signingKey().length>=32;
}
export function checkAdminPassword(password:unknown){
  if(!adminConfigured() || typeof password!=='string' || password.length>512) return false;
  const actual=createHash('sha256').update(password,'utf8').digest();
  const expected=Buffer.from(expectedHash(),'hex');
  return actual.length===expected.length && timingSafeEqual(actual,expected);
}
function signature(payload:string){
  return createHmac('sha256',signingKey()).update(payload).digest('hex');
}
export function issueAdminSession(now=Date.now()){
  if(!adminConfigured()) throw new Error('Admin access is not configured.');
  const payload='v1.'+String(now+SESSION_MILLIS);
  return {value:payload+'.'+signature(payload),maxAge:SESSION_MILLIS/1000};
}
export function verifyAdminSession(token:unknown,now=Date.now()){
  if(!adminConfigured() || typeof token!=='string')return false;
  const match=/^(v1\.\d{13})\.([a-f0-9]{64})$/i.exec(token);
  if(!match)return false;
  const expiry=Number(match[1].slice(3));
  if(!Number.isSafeInteger(expiry)||expiry<=now||expiry>now+SESSION_MILLIS+60_000)return false;
  const expected=Buffer.from(signature(match[1]),'hex');
  const actual=Buffer.from(match[2],'hex');
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
export async function isAdminSession(){
  const store=await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}
export function sameOrigin(request:Request){
  const origin=request.headers.get('origin');
  return Boolean(origin)&&origin===new URL(request.url).origin;
}
