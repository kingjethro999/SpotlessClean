import React from "react"
import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-amber-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto w-full lg:w-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
