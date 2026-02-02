'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface ClothingItem {
  id: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
}

interface StatusHistory {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface Request {
  id: string;
  status: string;
  total_cost: number;
  created_at: string;
  pickup_address: string;
  users?: { full_name: string; email: string; phone?: string };
  clothing_items?: ClothingItem[];
  status_history?: StatusHistory[];
}

export function OrderDetailView({ request }: { request: Request }) {
  const [selectedStatus, setSelectedStatus] = useState(request.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('cleaning_requests')
        .update({ status: selectedStatus })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Add to status history
      const { error: historyError } = await supabase
        .from('status_history')
        .insert({
          request_id: request.id,
          status: selectedStatus,
          notes: statusNotes,
        });

      if (historyError) throw historyError;

      alert('Status updated successfully');
      window.location.reload();
    } catch (error) {
      alert('Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Order {request.id.slice(0, 12)}</h1>
            <p className="text-amber-700">Created {formatDate(request.created_at)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
            {request.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Customer & Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-amber-700">Name</p>
              <p className="font-medium text-amber-900">{request.users?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-amber-700">Email</p>
              <p className="font-medium text-amber-900">{request.users?.email}</p>
            </div>
            <div>
              <p className="text-sm text-amber-700">Phone</p>
              <p className="font-medium text-amber-900">{request.users?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-amber-700">Pickup Address</p>
              <p className="font-medium text-amber-900">{request.pickup_address}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-amber-700">Items Count</span>
              <span className="font-medium text-amber-900">
                {request.clothing_items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
              </span>
            </div>
            <div className="flex justify-between border-t border-amber-200 pt-3 mt-3">
              <span className="font-semibold text-amber-900">Total Cost</span>
              <span className="font-bold text-lg text-amber-700">₦{request.total_cost?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clothing Items */}
      {request.clothing_items && request.clothing_items.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">Clothing Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-200">
                <tr>
                  <th className="text-left py-3 px-4 text-amber-900 font-semibold">Item Type</th>
                  <th className="text-left py-3 px-4 text-amber-900 font-semibold">Quantity</th>
                  <th className="text-left py-3 px-4 text-amber-900 font-semibold">Unit Price</th>
                  <th className="text-left py-3 px-4 text-amber-900 font-semibold">Subtotal</th>
                  <th className="text-left py-3 px-4 text-amber-900 font-semibold">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {request.clothing_items.map((item) => (
                  <tr key={item.id} className="border-b border-amber-100 hover:bg-amber-50">
                    <td className="py-3 px-4 text-amber-900 capitalize">{item.item_type}</td>
                    <td className="py-3 px-4 text-amber-900">{item.quantity}</td>
                    <td className="py-3 px-4 text-amber-900">₦{item.unit_price.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-amber-900">
                      ₦{(item.quantity * item.unit_price).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-amber-700">{item.special_instructions || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Update */}
      <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900 mb-4">Update Status</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">Notes (Optional)</label>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add any notes about this status update..."
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 resize-none"
              rows={3}
            />
          </div>
          <Button
            onClick={handleStatusUpdate}
            disabled={updating || selectedStatus === request.status}
            className="w-full bg-amber-700 hover:bg-amber-800"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>

      {/* Status History */}
      {request.status_history && request.status_history.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">Status History</h2>
          <div className="space-y-3">
            {request.status_history.map((history) => (
              <div key={history.id} className="pb-3 border-b border-amber-100 last:border-b-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                    {history.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-amber-700">{formatDate(history.created_at)}</span>
                </div>
                {history.notes && <p className="text-sm text-amber-700 ml-3">{history.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
