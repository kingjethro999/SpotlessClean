import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { OrdersManagement } from '@/components/admin/orders-management';

export default async function AdminOrdersPage() {
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
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Manage Orders</h1>
      <OrdersManagement />
    </div>
  );
}
