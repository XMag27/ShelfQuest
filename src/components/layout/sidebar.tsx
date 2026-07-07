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

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-purple-500/20 bg-slate-950/80 backdrop-blur-sm transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-purple-500/20 px-4 py-4">
        <Gamepad2 className="h-6 w-6 text-purple-400 shrink-0" />
        {!sidebarCollapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ShelfQuest
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const linkContent = (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </Link>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={<Link key={href} href={href} className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )} />}>
                  <Icon className="h-5 w-5 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-purple-500/20 p-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="w-full text-slate-400 hover:text-slate-200">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}