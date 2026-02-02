import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { NewRequestForm } from '@/components/customer/new-request-form';
import { ArrowLeft } from 'lucide-react';

export default async function NewRequestPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile to verify role
  const { data: userProfile } = await supabase.from('users').select('*').eq('auth_id', user.id).single();

  if (userProfile?.role !== 'customer') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium mb-4">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Create New Cleaning Request</h1>
        <p className="text-amber-700 mb-6">Fill in the details below to request cleaning services</p>

        <NewRequestForm userId={userProfile?.id} />
      </main>
    </div>
  );
}
