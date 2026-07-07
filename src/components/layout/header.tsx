'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-sm px-4 md:px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden text-slate-400" onClick={() => {}}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-slate-400 hover:text-slate-200">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-200">
          <Bell className="h-4 w-4" />
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white text-sm">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-purple-500/20">
              <DropdownMenuItem onClick={() => router.push('/profile')} className="text-slate-200 focus:bg-slate-800">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/stats')} className="text-slate-200 focus:bg-slate-800">
                Stats
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:bg-slate-800">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}