import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { OrderDetailView } from '@/components/admin/order-detail-view';

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Fetch request details
  const { data: request } = await supabase
    .from('cleaning_requests')
    .select('*, users (*), clothing_items (*), status_history (*)')
    .eq('id', params.id)
    .single();

  if (!request) {
    redirect('/admin/orders');
  }

  return (
    <div className="p-4 md:p-8">
      <OrderDetailView request={request} />
    </div>
  );
}
