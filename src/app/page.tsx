'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GameGrid } from '@/components/game/game-grid';
import { StatusBadge } from '@/components/game/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayStatus, playStatusLabelMap, platformLabelMap, GamePlatform, platformIconMap } from '@/types';
import Link from 'next/link';
import { Gamepad2, TrendingUp, Library, Clock, Sparkles, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading, initialized } = useAuthStore();
  const { games, loading: gamesLoading } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  if (authLoading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentlyPlaying = games.filter((g) => g.playStatus === PlayStatus.playing);
  const recentlyAdded = [...games].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 6);
  const totalHours = games.reduce((sum, g) => sum + g.hoursPlayed, 0);
  const avgRating = games.filter((g) => g.personalRating > 0);
  const averageRating = avgRating.length > 0
    ? (avgRating.reduce((sum, g) => sum + g.personalRating, 0) / avgRating.length).toFixed(1)
    : '—';

  const statusCounts = Object.values(PlayStatus).reduce<Record<string, number>>((acc, status) => {
    acc[status] = games.filter((g) => g.playStatus === status).length;
    return acc;
  }, {});

  const platformCounts = Object.values(GamePlatform).reduce<Record<string, number>>((acc, platform) => {
    acc[platform] = games.filter((g) => g.platforms.includes(platform)).length;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-600/20 border border-white/[0.06] p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Welcome back{user.displayName ? `, ${user.displayName}` : ''}
          </h1>
          <p className="text-slate-400 mt-2">Track your game backlog and progress</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full bg-cyan-500/10 blur-2xl" />
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors duration-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl stat-icon-violet">
              <Library className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{games.length}</p>
              <p className="text-xs text-slate-400 font-medium">Total Games</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors duration-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl stat-icon-green">
              <Gamepad2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentlyPlaying.length}</p>
              <p className="text-xs text-slate-400 font-medium">Playing</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors duration-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl stat-icon-blue">
              <Clock className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalHours}h</p>
              <p className="text-xs text-slate-400 font-medium">Hours Played</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors duration-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl stat-icon-amber">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{averageRating}</p>
              <p className="text-xs text-slate-400 font-medium">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
          <div className="p-4 pb-3">
            <h3 className="text-lg font-semibold text-white">By Status</h3>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {Object.entries(PlayStatus).map(([key, status]) => (
              <div key={status} className="flex items-center justify-between py-1">
                <StatusBadge status={status} />
                <span className="text-sm text-slate-300 font-medium">{statusCounts[status] || 0}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
          <div className="p-4 pb-3">
            <h3 className="text-lg font-semibold text-white">By Platform</h3>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {Object.entries(GamePlatform).map(([key, platform]) => (
              <div key={platform} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{platformIconMap[platform]}</span>
                  <span className="text-sm text-slate-300">{platformLabelMap[platform]}</span>
                </div>
                <span className="text-sm text-slate-400 font-medium">{platformCounts[platform] || 0}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Currently Playing */}
      {currentlyPlaying.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Currently Playing
            </h2>
            <Link href="/library?status=playing">
              <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-white/[0.04]">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <GameGrid games={currentlyPlaying.slice(0, 6)} loading={gamesLoading} />
        </div>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recently Added</h2>
            <Link href="/library">
              <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-white/[0.04]">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <GameGrid games={recentlyAdded} loading={gamesLoading} />
        </div>
      )}

      {games.length === 0 && !gamesLoading && (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-600/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="h-12 w-12 text-violet-400/60" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No games yet</h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start building your collection by searching for games</p>
          <Link href="/search">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20">
              Search Games
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}