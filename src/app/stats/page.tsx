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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
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

  // Color map for bars - using gradients
  const barColors: Record<string, string> = {
    [PlayStatus.backlog]: 'from-amber-500 to-amber-600',
    [PlayStatus.playing]: 'from-emerald-400 to-emerald-500',
    [PlayStatus.completed]: 'from-blue-400 to-blue-500',
    [PlayStatus.onHold]: 'from-orange-400 to-orange-500',
    [PlayStatus.dropped]: 'from-red-400 to-red-500',
    [PlayStatus.wishlist]: 'from-violet-400 to-violet-500',
  };

  const barBgColors: Record<string, string> = {
    [PlayStatus.backlog]: 'bg-amber-500/10',
    [PlayStatus.playing]: 'bg-emerald-500/10',
    [PlayStatus.completed]: 'bg-blue-500/10',
    [PlayStatus.onHold]: 'bg-orange-500/10',
    [PlayStatus.dropped]: 'bg-red-500/10',
    [PlayStatus.wishlist]: 'bg-violet-500/10',
  };

  const platformBarColors: Record<string, string> = {
    [GamePlatform.nintendoSwitch]: 'from-emerald-400 to-emerald-500',
    [GamePlatform.xbox]: 'from-green-400 to-green-500',
    [GamePlatform.steam]: 'from-blue-400 to-blue-500',
    [GamePlatform.playstation]: 'from-indigo-400 to-indigo-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Statistics</h1>
        <p className="text-slate-400 mt-1">Your gaming habits at a glance</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl stat-icon-violet">
              <Gamepad2 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalGames}</p>
              <p className="text-xs text-slate-400 font-medium">Total Games</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl stat-icon-green">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{statusCounts[PlayStatus.completed] || 0}</p>
              <p className="text-xs text-slate-400 font-medium">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
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

        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl stat-icon-amber">
              <Star className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{averageRating}</p>
              <p className="text-xs text-slate-400 font-medium">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-white">Games by Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(PlayStatus).map(([key, status]) => {
            const count = statusCounts[status] || 0;
            const percentage = totalGames > 0 ? (count / totalGames) * 100 : 0;
            const barWidth = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0;
            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-sm text-slate-300 font-medium">
                    {count} <span className="text-slate-500">({percentage.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className={`h-2 ${barBgColors[status] || 'bg-white/[0.04]'} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barColors[status] || 'from-slate-400 to-slate-500'} transition-all duration-500`}
                    style={{ width: `${Math.max(barWidth, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Platform Distribution */}
      <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-white">Games by Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(GamePlatform).map(([key, platform]) => {
            const count = platformCounts[platform] || 0;
            const percentage = totalGames > 0 ? (count / totalGames) * 100 : 0;
            const barWidth = maxPlatformCount > 0 ? (count / maxPlatformCount) * 100 : 0;
            return (
              <div key={platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{platformIconMap[platform]}</span>
                    <span className="text-sm text-slate-300">{platformLabelMap[platform]}</span>
                  </div>
                  <span className="text-sm text-slate-300 font-medium">
                    {count} <span className="text-slate-500">({percentage.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${platformBarColors[platform] || 'from-slate-400 to-slate-500'} transition-all duration-500`}
                    style={{ width: `${Math.max(barWidth, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">Completion Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Completion Rate</span>
              <span className="text-white font-medium">
                {totalGames > 0
                  ? (((statusCounts[PlayStatus.completed] || 0) / totalGames) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Drop Rate</span>
              <span className="text-white font-medium">
                {totalGames > 0
                  ? (((statusCounts[PlayStatus.dropped] || 0) / totalGames) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Games Rated</span>
              <span className="text-white font-medium">{ratedGames.length} / {totalGames}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">Time Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Hours</span>
              <span className="text-white font-medium">{totalHours}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Avg Hours/Game</span>
              <span className="text-white font-medium">
                {totalGames > 0 ? (totalHours / totalGames).toFixed(1) : 0}h
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Avg Rating</span>
              <span className="text-white font-medium">{averageRating} / 10</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}