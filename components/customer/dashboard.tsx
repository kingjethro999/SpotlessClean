'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RequestCard } from './request-card';
import { LogOut } from 'lucide-react';

interface CleaningRequest {
  id: string;
  status: string;
  total_cost: number;
  created_at: string;
  pickup_date: string;
  item_count: number;
}

export function Dashboard({ initialUser }: { initialUser: any }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('cleaning_requests')
        .select(
          `
          id,
          status,
          total_cost,
          created_at,
          scheduled_pickup,
          total_items
        `
        )
        .eq('user_id', initialUser?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setRequests(
          data?.map((req: any) => ({
            ...req,
            pickup_date: req.scheduled_pickup,
            item_count: req.total_items,
          })) || []
        );
      }
      setLoading(false);
    };

    if (initialUser?.id) {
      fetchRequests();

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`requests:user_id=eq.${initialUser.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cleaning_requests' }, (payload: any) => {
          fetchRequests();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [initialUser?.id, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-900">SpotlessClean Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">Welcome, {initialUser?.user_metadata?.full_name || 'User'}</h2>
          <p className="text-amber-700 mb-4">Manage your cleaning requests and track their status</p>
          <Link href="/dashboard/new-request">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white">Create New Request</Button>
          </Link>
        </div>

        {/* Requests Section */}
        <div>
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Your Requests</h3>

          {loading ? (
            <div className="text-center py-8 text-amber-700">Loading your requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-amber-200">
              <p className="text-amber-700 mb-4">No cleaning requests yet</p>
              <Link href="/dashboard/new-request">
                <Button className="bg-amber-700 hover:bg-amber-800">Create Your First Request</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
