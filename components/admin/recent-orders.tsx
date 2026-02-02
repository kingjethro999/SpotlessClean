'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Request {
  id: string;
  status: string;
  total_cost: number;
  created_at: string;
  users?: { full_name: string };
}

export function RecentOrders() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('cleaning_requests')
        .select('id, status, total_cost, created_at, users (full_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRequests(data as Request[]);
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
        <h2 className="text-xl font-semibold text-amber-900 mb-4">Recent Orders</h2>
        <p className="text-amber-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-amber-900">Recent Orders</h2>
        <Link href="/admin/orders">
          <Button className="bg-amber-700 hover:bg-amber-800 text-sm">View All</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-amber-200">
            <tr>
              <th className="text-left py-3 px-4 text-amber-900 font-semibold">Order ID</th>
              <th className="text-left py-3 px-4 text-amber-900 font-semibold">Customer</th>
              <th className="text-left py-3 px-4 text-amber-900 font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-amber-900 font-semibold">Amount</th>
              <th className="text-left py-3 px-4 text-amber-900 font-semibold">Date</th>
              <th className="text-left py-3 px-4 text-amber-900 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-amber-100 hover:bg-amber-50">
                <td className="py-3 px-4 text-amber-900 font-mono text-xs">{request.id.slice(0, 8)}</td>
                <td className="py-3 px-4 text-amber-900">{request.users?.full_name || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-amber-900">₦{request.total_cost?.toLocaleString()}</td>
                <td className="py-3 px-4 text-amber-700">{formatDate(request.created_at)}</td>
                <td className="py-3 px-4">
                  <Link href={`/admin/orders/${request.id}`}>
                    <Button size="sm" variant="outline" className="text-xs border-amber-300 bg-transparent">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
