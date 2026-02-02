import { Package, Users, Clock, CheckCircle } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalOrders: number;
    totalCustomers: number;
    pendingOrders: number;
    completedOrders: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Orders */}
      <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-700 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-amber-900">{stats.totalOrders}</p>
          </div>
          <Package className="text-amber-700" size={32} />
        </div>
      </div>

      {/* Total Customers */}
      <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-700 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-amber-900">{stats.totalCustomers}</p>
          </div>
          <Users className="text-amber-700" size={32} />
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-700 mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-amber-900">{stats.pendingOrders}</p>
          </div>
          <Clock className="text-amber-700" size={32} />
        </div>
      </div>

      {/* Completed Orders */}
      <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-700 mb-1">Completed Orders</p>
            <p className="text-3xl font-bold text-amber-900">{stats.completedOrders}</p>
          </div>
          <CheckCircle className="text-amber-700" size={32} />
        </div>
      </div>
    </div>
  );
}
