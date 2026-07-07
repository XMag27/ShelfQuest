'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { PlayStatus, GamePlatform, playStatusLabelMap, platformLabelMap, platformIconMap } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/game/status-badge';
import { Gamepad2, TrendingUp, Clock, Star } from 'lucide-react';

export default function StatsPage() {
  const { user, initialized } = useAuthStore();
  const { games } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const totalGames = games.length;
  const totalHours = games.reduce((sum, g) => sum + g.hoursPlayed, 0);
  const ratedGames = games.filter((g) => g.personalRating > 0);
  const averageRating = ratedGames.length > 0
    ? (ratedGames.reduce((sum, g) => sum + g.personalRating, 0) / ratedGames.length).toFixed(1)
    : '—';

  const statusCounts = Object.values(PlayStatus).reduce<Record<string, number>>((acc, status) => {
    acc[status] = games.filter((g) => g.playStatus === status).length;
    return acc;
  }, {});

  const platformCounts = Object.values(GamePlatform).reduce<Record<string, number>>((acc, platform) => {
    acc[platform] = games.filter((g) => g.platforms.includes(platform)).length;
    return acc;
  }, {});

  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);
  const maxPlatformCount = Math.max(...Object.values(platformCounts), 1);

  // Color map for bars
  const barColors: Record<string, string> = {
    [PlayStatus.backlog]: 'bg-gray-500',
    [PlayStatus.playing]: 'bg-green-500',
    [PlayStatus.completed]: 'bg-blue-500',
    [PlayStatus.onHold]: 'bg-yellow-500',
    [PlayStatus.dropped]: 'bg-red-500',
    [PlayStatus.wishlist]: 'bg-purple-500',
  };

  const platformColors: Record<string, string> = {
    [GamePlatform.nintendoSwitch]: 'bg-green-500',
    [GamePlatform.xbox]: 'bg-emerald-500',
    [GamePlatform.steam]: 'bg-blue-500',
    [GamePlatform.playstation]: 'bg-indigo-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Statistics</h1>
        <p className="text-slate-400 mt-1">Your gaming habits at a glance</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-purple-500/20 bg-slate-900/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Gamepad2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{totalGames}</p>
              <p className="text-xs text-slate-400">Total Games</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-slate-900/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{statusCounts[PlayStatus.completed] || 0}</p>
              <p className="text-xs text-slate-400">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-slate-900/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-400" />
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
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{averageRating}</p>
              <p className="text-xs text-slate-400">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="border-purple-500/20 bg-slate-900/80">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Games by Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(PlayStatus).map(([key, status]) => {
            const count = statusCounts[status] || 0;
            const percentage = totalGames > 0 ? (count / totalGames) * 100 : 0;
            return (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                  </div>
                  <span className="text-sm text-slate-300">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColors[status] || 'bg-slate-500'}`}
                    style={{ width: `${Math.max(percentage, count > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Platform Distribution */}
      <Card className="border-purple-500/20 bg-slate-900/80">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Games by Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(GamePlatform).map(([key, platform]) => {
            const count = platformCounts[platform] || 0;
            const percentage = totalGames > 0 ? (count / totalGames) * 100 : 0;
            return (
              <div key={platform} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{platformIconMap[platform]}</span>
                    <span className="text-sm text-slate-300">{platformLabelMap[platform]}</span>
                  </div>
                  <span className="text-sm text-slate-300">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${platformColors[platform] || 'bg-slate-500'}`}
                    style={{ width: `${Math.max(percentage, count > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-purple-500/20 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Completion Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Completion Rate</span>
              <span className="text-slate-200">
                {totalGames > 0
                  ? (((statusCounts[PlayStatus.completed] || 0) / totalGames) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Drop Rate</span>
              <span className="text-slate-200">
                {totalGames > 0
                  ? (((statusCounts[PlayStatus.dropped] || 0) / totalGames) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Games Rated</span>
              <span className="text-slate-200">{ratedGames.length} / {totalGames}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Time Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Hours</span>
              <span className="text-slate-200">{totalHours}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Avg Hours/Game</span>
              <span className="text-slate-200">
                {totalGames > 0 ? (totalHours / totalGames).toFixed(1) : 0}h
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Avg Rating</span>
              <span className="text-slate-200">{averageRating} / 10</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}