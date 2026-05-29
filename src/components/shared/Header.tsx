'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const { userName, userType } = useAuth();

  // Derive page title from pathname
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    
    // Remove leading slash, replace hyphens with spaces, capitalize words
    return pathname
      .slice(1)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-800/40 bg-white/5 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-white hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        {/* Mock Notifications */}
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-950" />
        </Button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none mb-1">
              {userName || 'User'}
            </p>
            <Badge 
              variant="outline" 
              className={`h-5 px-1.5 text-[10px] font-semibold tracking-wide uppercase ${
                userType === 'admin' 
                  ? 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' 
                  : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
              }`}
            >
              {userType || 'Guest'}
            </Badge>
          </div>
          
          <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-slate-900 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
              {getInitials(userName || 'User')}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
