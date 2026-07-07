'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Bell, Moon, Sun, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 bg-[#0a0a12]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-6">
      {/* Mobile menu button placeholder */}
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Search shortcut hint - desktop */}
      <button
        onClick={() => router.push('/search')}
        className="hidden md:flex items-center gap-2 h-9 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 text-sm flex-1 max-w-xs"
      >
        <Search className="h-4 w-4" />
        <span>Search games...</span>
        <kbd className="ml-auto inline-flex h-5 items-center gap-1 rounded border border-white/[0.08] bg-white/[0.03] px-1.5 text-[10px] font-medium text-slate-500">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] rounded-xl"
        >
          {mounted ? (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Sun className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] rounded-xl">
          <Bell className="h-4 w-4" />
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-xl ml-1" />}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-semibold">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a2e]/95 backdrop-blur-xl border-white/[0.08] shadow-xl shadow-black/30">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-200">{user.displayName || 'User'}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={() => router.push('/profile')} className="text-slate-300 focus:bg-white/[0.04] focus:text-slate-100 rounded-lg cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/stats')} className="text-slate-300 focus:bg-white/[0.04] focus:text-slate-100 rounded-lg cursor-pointer">
                Stats
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:bg-red-500/[0.06] focus:text-red-300 rounded-lg cursor-pointer">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}