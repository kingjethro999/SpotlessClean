'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Package, MessageSquare, Users, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@supabase/ssr';


export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse

  // Initialize collapse state from localStorage on mount (client-side only)
  React.useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
  };

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/requests', label: 'Requests', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/admin/(auth)/login');
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-amber-900 text-white p-2 rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen z-40 bg-amber-900 text-white flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[70px]' : 'lg:w-64'}
          w-64
        `}
      >
        {/* Logo area */}
        <div className={`p-4 border-b border-amber-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all duration-300 h-16`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo size={28} className="flex-shrink-0" />
            {!isCollapsed && (
              <div className="whitespace-nowrap opacity-100 transition-opacity duration-300">
                <h1 className="text-lg font-bold">SpotlessClean</h1>
                <p className="text-xs text-amber-200">Admin Panel</p>
              </div>
            )}
          </div>
          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center text-amber-200 hover:text-white transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            {/* Using Menu/X or ChevronLeft/Right icons for collapse */}
          </button>
        </div>

        {/* Collapse Toggle Button (Below Header for clearer semantics or integrated? Let's fix the layout) */}
        {/* Re-design: Put collapse toggle in a better spot or keep using the X/Menu metaphor? 
             Actually, usually it's a Chevron on the border or a separate button. 
             Let's use a standard chevron pattern if possible, or just keep it simple.
             I'll refine the header to have the toggle if not collapsed, or specific button if collapsed.
         */}

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={isCollapsed ? item.label : ''}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm
                  ${isActive ? 'bg-amber-700 text-white shadow-sm' : 'text-amber-100 hover:bg-amber-800'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate transition-opacity duration-300">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-amber-800">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full flex items-center gap-2 text-red-300 hover:text-white hover:bg-red-900/50 
              ${isCollapsed ? 'justify-center px-0' : 'justify-start'}
            `}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
