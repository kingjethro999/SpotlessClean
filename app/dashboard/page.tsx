import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Dashboard } from '@/components/customer/dashboard';

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: userProfile } = await supabase.from('users').select('*').eq('auth_id', user.id).single();

  // Redirect admins to admin panel
  if (userProfile?.role === 'admin' || userProfile?.role === 'staff') {
    redirect('/admin');
  }

  return <Dashboard initialUser={{ ...user, ...userProfile }} />;
}
