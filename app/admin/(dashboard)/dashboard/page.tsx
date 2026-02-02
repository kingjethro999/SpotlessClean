import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { StatsOverview } from '@/components/admin/stats-overview';
import { RecentOrders } from '@/components/admin/recent-orders';

export default async function AdminDashboardPage() {
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

  // Get stats
  const { data: allRequests } = await supabase
    .from('cleaning_requests')
    .select('id, status');

  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'customer');

  const stats = {
    totalOrders: allRequests?.length || 0,
    totalCustomers: users?.length || 0,
    pendingOrders: allRequests?.filter((r) => r.status === 'pending').length || 0,
    completedOrders: allRequests?.filter((r) => r.status === 'completed').length || 0,
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Dashboard</h1>
        <p className="text-amber-700">Welcome back, {userProfile?.full_name || 'Staff'}</p>
      </div>

      <StatsOverview stats={stats} />
      <RecentOrders />
    </div>
  );
}
