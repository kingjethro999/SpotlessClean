'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RequestsTable } from './requests-table';
import { UsersTable } from './users-table';
import { LogOut } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export function AdminDashboard({ adminUser }: { adminUser: AdminUser }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState('requests');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">SpotlessClean Admin</h1>
            <p className="text-sm text-amber-600">Welcome, {adminUser?.full_name}</p>
          </div>
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border border-amber-200">
            <TabsTrigger value="requests" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Cleaning Requests
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <RequestsTable adminRole={adminUser?.role} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
