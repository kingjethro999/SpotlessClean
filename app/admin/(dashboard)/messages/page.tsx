import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { AdminMessaging } from '@/components/admin/admin-messaging';

export default async function AdminMessagesPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  // Check if user is admin or staff
  if (userProfile?.role !== 'admin' && userProfile?.role !== 'staff') {
    redirect('/dashboard');
  }

  return (
    <div className="p-4 md:p-8 h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Messages</h1>
      <AdminMessaging staffId={userProfile?.id} staffName={userProfile?.full_name} />
    </div>
  );
}
