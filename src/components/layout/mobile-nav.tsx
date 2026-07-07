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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/20 bg-slate-950/95 backdrop-blur-sm">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors',
                isActive ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}