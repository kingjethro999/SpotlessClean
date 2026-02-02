import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { AdminRequestDetail } from '@/components/admin/request-detail';
import { ArrowLeft } from 'lucide-react';

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: requestId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (userProfile?.role !== 'admin' && userProfile?.role !== 'staff') {
    redirect('/dashboard');
  }

  // Get cleaning request
  const { data: request } = await supabase
    .from('cleaning_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!request) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium mb-4">
            <ArrowLeft size={20} />
            Back to Admin
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-6">Request Details</h1>
        <AdminRequestDetail requestId={requestId} initialRequest={request} />
      </main>
    </div>
  );
}
