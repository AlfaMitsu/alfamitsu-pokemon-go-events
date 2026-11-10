'use client';
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
export default function AdminLogin(){
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const router=useRouter();
  async function login(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');
    try{
      const response=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({password})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Unable to sign in.');
      setPassword('');router.replace('/admin');router.refresh();
    }catch(e){setError(e instanceof Error?e.message:'Unable to sign in.');}
    finally{setBusy(false);}
  }
  return <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-5">
    <div className="w-full max-w-md rounded-2xl border border-sky-900 bg-slate-900 p-7 shadow-xl">
      <a href="/" className="text-sm text-sky-300 hover:underline">← Back to AlfaMitsu Services</a>
      <h1 className="mt-6 text-2xl font-bold">Owner quality review</h1>
      <p className="mt-2 text-sm text-slate-300">Private event and image integrity dashboard. This is not a public trainer account.</p>
      <form onSubmit={login} className="mt-6 space-y-4">
        <label className="block text-sm font-medium" htmlFor="access-password">Owner access password</label>
        <input id="access-password" autoComplete="current-password" autoFocus type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-lg border border-sky-700 bg-slate-950 px-3 py-3 outline-none focus:ring-2 focus:ring-sky-400"/>
        {error&&<p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-sky-600 px-4 py-3 font-semibold hover:bg-sky-500 disabled:opacity-60">{busy?'Checking…':'Sign in securely'}</button>
      </form>
      <p className="mt-5 text-xs text-slate-400">Sessions expire after 8 hours. Credentials are not embedded in the website.</p>
    </div>
  </main>;
}
