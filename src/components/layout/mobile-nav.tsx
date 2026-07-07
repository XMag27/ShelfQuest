'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Search, FolderOpen, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/collections', label: 'Collections', icon: FolderOpen },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a12]/90 backdrop-blur-2xl border-t border-white/[0.06]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-violet-400 scale-105'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <div className={cn(
                'flex items-center justify-center rounded-lg p-1 transition-all duration-200',
                isActive && 'bg-violet-500/15'
              )}>
                <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive && 'scale-110')} />
              </div>
              <span className={cn('text-[10px] font-medium transition-colors duration-200', isActive && 'text-violet-400')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}