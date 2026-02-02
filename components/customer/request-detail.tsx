'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import { Messaging } from './messaging';

interface RequestDetailProps {
  requestId: string;
  initialData: any;
  userId: string;
}

export function RequestDetail({ requestId, initialData, userId }: RequestDetailProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [request, setRequest] = useState(initialData);
  const [items, setItems] = useState<any[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      // Fetch clothing items
      const { data: itemsData } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('request_id', requestId);

      if (itemsData) setItems(itemsData);

      // Fetch status history
      const { data: historyData } = await supabase
        .from('status_history')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (historyData) setStatusHistory(historyData);
    };

    fetchDetails();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`request:id=eq.${requestId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cleaning_requests' }, (payload: any) => {
        setRequest(payload.new || request);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_history' }, () => {
        fetchDetails();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, supabase]);

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

  const getProgressPercentage = (status: string) => {
    const statuses = ['pending', 'in_progress', 'ready_for_pickup', 'picked_up', 'completed'];
    const index = statuses.indexOf(status);
    return ((index + 1) / statuses.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="bg-white rounded-lg border border-amber-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-amber-900">Request #{requestId.slice(0, 8).toUpperCase()}</h2>
            <p className="text-sm text-amber-600">Created {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</p>
          </div>
          <Badge className={getStatusColor(request.status)}>{formatStatus(request.status)}</Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-600" style={{ width: `${getProgressPercentage(request.status)}%` }} />
          </div>
          <p className="text-xs text-amber-600 mt-2">
            Progress: {Math.round(getProgressPercentage(request.status))}%
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-amber-600 uppercase">Items</p>
            <p className="text-lg font-semibold text-amber-900">{items.length}</p>
          </div>
          <div>
            <p className="text-xs text-amber-600 uppercase">Cost</p>
            <p className="text-lg font-semibold text-amber-900">₦{request.total_cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-amber-600 uppercase">Pickup Date</p>
            <p className="text-lg font-semibold text-amber-900">{new Date(request.scheduled_pickup).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-amber-600 uppercase">Payment</p>
            <p className="text-lg font-semibold text-amber-900">Cash/Transfer</p>
          </div>
        </div>
      </div>

      {/* Clothing Items */}
      <div className="bg-white rounded-lg border border-amber-200 p-6">
        <h3 className="font-semibold text-amber-900 mb-4">Clothing Items</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-amber-200 rounded p-3 bg-amber-50">
              <div className="flex justify-between mb-2">
                <p className="font-medium text-amber-900">{item.item_type}</p>
                <p className="text-amber-700">
                  {item.quantity} x ₦{item.estimated_cost.toLocaleString()}
                </p>
              </div>
              {item.special_instructions && (
                <p className="text-sm text-amber-700 italic">Instructions: {item.special_instructions}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg border border-amber-200 p-6">
        <h3 className="font-semibold text-amber-900 mb-4">Status History</h3>
        <div className="space-y-4">
          {statusHistory.length === 0 ? (
            <p className="text-amber-700">No status updates yet</p>
          ) : (
            statusHistory.map((entry, index) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <CheckCircle size={20} className="text-amber-600" />
                  {index < statusHistory.length - 1 && <div className="w-0.5 h-12 bg-amber-300 my-2" />}
                </div>
                <div>
                  <p className="font-medium text-amber-900">{formatStatus(entry.new_status)}</p>
                  <p className="text-sm text-amber-600">{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</p>
                  {entry.notes && <p className="text-sm text-amber-700 mt-1">{entry.notes}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messaging */}
      <Messaging requestId={requestId} userId={userId} />
    </div>
  );
}
