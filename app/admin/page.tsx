import {redirect} from 'next/navigation';
import type {Metadata} from 'next';
import {isAdminSession} from '@/lib/admin-auth';
import QualityDashboard from '@/components/admin/QualityDashboard';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Owner Quality Review | AlfaMitsu Services',robots:{index:false,follow:false}};
export default async function AdminPage(){
  if(!(await isAdminSession()))redirect('/admin/login');
  return <QualityDashboard/>;
}
