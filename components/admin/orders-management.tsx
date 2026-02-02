'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';

interface Request {
  id: string;
  status: string;
  total_cost: number;
  created_at: string;
  users?: { full_name: string; email: string };
}

export function OrdersManagement() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('cleaning_requests')
      .select('id, status, total_cost, created_at, users (full_name, email)')
      .order('created_at', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (!error && data) {
      setRequests(data as Request[]);
    }
    setLoading(false);
  };

  const filteredRequests = requests.filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      request.id.toLowerCase().includes(searchLower) ||
      request.users?.full_name?.toLowerCase().includes(searchLower) ||
      request.users?.email?.toLowerCase().includes(searchLower)
    );
  });

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
    return <div className="text-amber-700">Loading orders...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-amber-200 shadow-sm">
      {/* Filters */}
      <div className="p-6 border-b border-amber-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Search by order ID, customer name, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-amber-200"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-amber-50 border-b border-amber-200">
            <tr>
              <th className="text-left py-4 px-6 text-amber-900 font-semibold">Order ID</th>
              <th className="text-left py-4 px-6 text-amber-900 font-semibold">Customer</th>
              <th className="text-left py-4 px-6 text-amber-900 font-semibold">Status</th>
              <th className="text-left py-4 px-6 text-amber-900 font-semibold">Amount</th>
              <th className="text-left py-4 px-6 text-amber-900 font-semibold">Date</th>
              <th className="text-left py-4 px-6 text-amber-900 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-6 text-center text-amber-700">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.id} className="border-b border-amber-100 hover:bg-amber-50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-amber-900">{request.id.slice(0, 12)}</td>
                  <td className="py-4 px-6 text-amber-900">
                    <div className="font-medium">{request.users?.full_name}</div>
                    <div className="text-xs text-amber-700">{request.users?.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-amber-900 font-semibold">₦{request.total_cost?.toLocaleString()}</td>
                  <td className="py-4 px-6 text-amber-700 text-xs">{formatDate(request.created_at)}</td>
                  <td className="py-4 px-6">
                    <Link href={`/admin/orders/${request.id}`}>
                      <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-xs">
                        Manage
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-6 border-t border-amber-200 bg-amber-50">
        <p className="text-sm text-amber-700">
          Showing <span className="font-semibold">{filteredRequests.length}</span> of{' '}
          <span className="font-semibold">{requests.length}</span> orders
        </p>
      </div>
    </div>
  );
}
