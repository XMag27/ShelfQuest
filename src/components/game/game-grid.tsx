'use client';

import { type Game } from '@/types';
import { GameCard } from './game-card';

interface GameGridProps {
  games: Game[];
  loading?: boolean;
}

function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="aspect-[3/4] shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded bg-white/[0.04] animate-pulse w-3/4" />
        <div className="h-3 rounded bg-white/[0.04] animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export function GameGrid({ games, loading }: GameGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <span className="text-4xl opacity-40">🎮</span>
        </div>
        <p className="text-lg font-medium text-slate-400">No games found</p>
        <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or add games from search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}