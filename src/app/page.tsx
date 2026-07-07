'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GameGrid } from '@/components/game/game-grid';
import { StatusBadge } from '@/components/game/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayStatus, playStatusLabelMap, platformLabelMap, GamePlatform, platformIconMap } from '@/types';
import Link from 'next/link';
import { Gamepad2, TrendingUp, Library, Clock } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Welcome back{user.displayName ? `, ${user.displayName}` : ''}
        </h1>
        <p className="text-slate-400 mt-1">Track your game backlog and progress</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-purple-500/20 bg-slate-900/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Library className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{games.length}</p>
              <p className="text-xs text-slate-400">Total Games</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-slate-900/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Gamepad2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{currentlyPlaying.length}</p>
              <p className="text-xs text-slate-400">Playing</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-slate-900/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Clock className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{totalHours}h</p>
              <p className="text-xs text-slate-400">Hours Played</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-slate-900/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{averageRating}</p>
              <p className="text-xs text-slate-400">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-purple-500/20 bg-slate-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-200">By Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(PlayStatus).map(([key, status]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                </div>
                <span className="text-sm text-slate-300">{statusCounts[status] || 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-slate-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-200">By Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(GamePlatform).map(([key, platform]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{platformIconMap[platform]}</span>
                  <span className="text-sm text-slate-300">{platformLabelMap[platform]}</span>
                </div>
                <span className="text-sm text-slate-400">{platformCounts[platform] || 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Currently Playing */}
      {currentlyPlaying.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-200">Currently Playing</h2>
            <Link href="/library?status=playing">
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                View All
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
            <h2 className="text-xl font-semibold text-slate-200">Recently Added</h2>
            <Link href="/library">
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                View All
              </Button>
            </Link>
          </div>
          <GameGrid games={recentlyAdded} loading={gamesLoading} />
        </div>
      )}

      {games.length === 0 && !gamesLoading && (
        <div className="text-center py-16">
          <Gamepad2 className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-slate-300 mb-2">No games yet</h2>
          <p className="text-slate-500 mb-6">Start building your collection by searching for games</p>
          <Link href="/search">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Search Games
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}