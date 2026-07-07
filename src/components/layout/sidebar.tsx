'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import {
  Home,
  Library,
  Search,
  FolderOpen,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/collections', label: 'Collections', icon: FolderOpen },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full border-r border-white/[0.06] bg-[#0c0c18]/95 backdrop-blur-xl transition-all duration-300 ease-in-out relative',
        sidebarCollapsed ? 'w-[72px]' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shrink-0 shadow-lg shadow-violet-500/20">
          <Gamepad2 className="h-5 w-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-lg font-bold gradient-text tracking-tight">
            ShelfQuest
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const linkContent = (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-violet-400 to-indigo-500" />
              )}
              <Icon className={cn(
                'h-5 w-5 shrink-0 transition-colors duration-200',
                isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
              )} />
              {!sidebarCollapsed && <span>{label}</span>}
            </Link>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={<Link key={href} href={href} className={cn(
                  'flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
                )} />}>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-violet-400 to-indigo-500" />
                  )}
                  <Icon className={cn(
                    'h-5 w-5 shrink-0 transition-colors duration-200',
                    isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                  )} />
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#1a1a2e] border-white/[0.08] text-slate-200">{label}</TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* User section */}
      {user && !sidebarCollapsed && (
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white/[0.02]">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-semibold">
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.displayName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.06] p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}