'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { user, initialized, initialize } = useAuthStore();
  const { loadGames, loadCollections } = useGameStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (user && initialized) {
      loadGames(user.uid);
      loadCollections(user.uid);
    }
  }, [user, initialized, loadGames, loadCollections]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <AuthInitializer>
              <div className="flex h-screen overflow-hidden">
                {/* Sidebar - desktop only */}
                <Sidebar />

                {/* Main content area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
                    {children}
                  </main>
                </div>
              </div>

              {/* Mobile nav - mobile only */}
              <MobileNav />
            </AuthInitializer>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}