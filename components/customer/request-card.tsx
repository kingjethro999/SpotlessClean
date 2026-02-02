'use client';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface RequestCardProps {
  request: {
    id: string;
    status: string;
    total_cost: number;
    created_at: string;
    pickup_date: string;
    item_count: number;
  };
}

export function RequestCard({ request }: RequestCardProps) {
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

  return (
    <Link href={`/dashboard/requests/${request.id}`}>
      <div className="bg-white rounded-lg border border-amber-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-semibold text-amber-900"># {request.id.slice(0, 8).toUpperCase()}</h4>
            <p className="text-sm text-amber-600">{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</p>
          </div>
          <Badge className={getStatusColor(request.status)}>{formatStatus(request.status)}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-amber-600 uppercase">Items</p>
            <p className="text-lg font-semibold text-amber-900">{request.item_count}</p>
          </div>
          <div>
            <p className="text-xs text-amber-600 uppercase">Cost</p>
            <p className="text-lg font-semibold text-amber-900">₦{request.total_cost.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-amber-200">
          <p className="text-sm text-amber-700">Pickup: {new Date(request.pickup_date).toLocaleDateString()}</p>
          <ChevronRight size={16} className="text-amber-600" />
        </div>
      </div>
    </Link>
  );
}
