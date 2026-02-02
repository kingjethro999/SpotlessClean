'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Request {
  id: string;
  user_id: string;
  status: string;
  total_cost: number;
  created_at: string;
  pickup_date: string;
  user_email?: string;
  user_name?: string;
}

export function RequestsTable({ adminRole }: { adminRole: string }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('cleaning_requests')
        .select('*, user:users(email, full_name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setRequests(
          data?.map((req: any) => ({
            ...req,
            user_email: req.user?.email,
            user_name: req.user?.full_name,
          })) || []
        );
      }
      setLoading(false);
    };

    fetchRequests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cleaning_requests' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    const { error: statusError } = await supabase
      .from('cleaning_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (!statusError) {
      // Add status history
      await supabase.from('status_history').insert([
        {
          request_id: requestId,
          new_status: newStatus,
          notes: '',
        },
      ]);

      // Refresh requests
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: newStatus }
            : req
        )
      );
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      ready_for_pickup: 'bg-green-100 text-green-800',
      picked_up: 'bg-gray-100 text-gray-800',
      completed: 'bg-amber-100 text-amber-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  if (loading) {
    return <div className="text-center py-8 text-amber-700">Loading requests...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-amber-50 border-b border-amber-200">
          <TableRow>
            <TableHead className="text-amber-900">Request ID</TableHead>
            <TableHead className="text-amber-900">Customer</TableHead>
            <TableHead className="text-amber-900">Status</TableHead>
            <TableHead className="text-amber-900">Cost</TableHead>
            <TableHead className="text-amber-900">Pickup Date</TableHead>
            <TableHead className="text-amber-900">Created</TableHead>
            <TableHead className="text-amber-900 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="border-b border-amber-100 hover:bg-amber-50">
              <TableCell className="font-medium text-amber-900">
                {request.id.slice(0, 8).toUpperCase()}
              </TableCell>
              <TableCell className="text-amber-900">
                <div>
                  <p className="font-medium">{request.user_name}</p>
                  <p className="text-xs text-amber-600">{request.user_email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(request.status)}>
                  {formatStatus(request.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-amber-900">₦{request.total_cost.toLocaleString()}</TableCell>
              <TableCell className="text-amber-900">
                {new Date(request.pickup_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-sm text-amber-600">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Select value={request.status} onValueChange={(value) => updateRequestStatus(request.id, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Link href={`/admin/requests/${request.id}`}>
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {requests.length === 0 && (
        <div className="text-center py-12 text-amber-700">No cleaning requests found</div>
      )}
    </div>
  );
}
