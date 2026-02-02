import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { RequestDetail } from '@/components/customer/request-detail';
import { ArrowLeft } from 'lucide-react';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: requestId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: userProfile } = await supabase.from('users').select('*').eq('auth_id', user.id).single();

  if (userProfile?.role !== 'customer') {
    redirect('/admin');
  }

  // Get cleaning request
  const { data: request } = await supabase
    .from('cleaning_requests')
    .select('*')
    .eq('id', requestId)
    .eq('user_id', userProfile?.id)
    .single();

  if (!request) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium mb-4">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <RequestDetail requestId={requestId} initialData={request} userId={userProfile?.id} />
      </main>
    </div>
  );
}
