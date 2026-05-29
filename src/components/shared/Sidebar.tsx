'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_NAV_ITEMS, USER_NAV_ITEMS, COMPANY_NAME } from '@/constants';
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  Users,
  FileDown,
  UserCircle,
  KeyRound,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Map icon names from constants to Lucide components
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  Users,
  FileDown,
  UserCircle,
  KeyRound,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { userType, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!mounted) return <div className="w-[280px] hidden lg:block bg-slate-950 border-r border-slate-800 h-full" />;

  const navItems = userType === 'admin' ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[280px] flex flex-col bg-slate-950 border-r border-slate-800/60 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none" />

        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60 relative z-10 shrink-0">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => window.innerWidth < 1024 && onClose()}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight gradient-text">
              Majesto Tracking
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 -mr-2 text-slate-400 hover:text-white lg:hidden transition-colors rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 relative z-10 custom-scrollbar">
          <div className="mb-4 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${
                  isActive
                    ? 'text-white font-medium bg-slate-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-xl" />
                )}
                
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout Area */}
        <div className="p-4 border-t border-slate-800/60 relative z-10 shrink-0">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-xl px-3"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
          <div className="mt-4 px-3 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 {COMPANY_NAME}</span>
            <span>v0.1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
