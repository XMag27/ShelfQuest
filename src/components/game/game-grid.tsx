'use client';

import { type Game } from '@/types';
import { GameCard } from './game-card';
import { Card, CardContent } from '@/components/ui/card';

interface GameGridProps {
  games: Game[];
  loading?: boolean;
}

function GameCardSkeleton() {
  return (
    <Card className="overflow-hidden border-purple-500/10 bg-slate-900/80">
      <div className="aspect-[3/4] bg-slate-800 animate-pulse" />
      <CardContent className="p-3 space-y-2">
        <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-slate-800 rounded animate-pulse w-1/2" />
      </CardContent>
    </Card>
  );
}

export function GameGrid({ games, loading }: GameGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <p className="text-lg">No games found</p>
        <p className="text-sm mt-1">Try adjusting your filters or add games from search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}