'use client';

import { type Game, platformIconMap, platformLabelMap, playStatusLabelMap, playStatusColorMap } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface GameListItemProps {
  game: Game;
}

export function GameListItem({ game }: GameListItemProps) {
  const statusColor = playStatusColorMap[game.playStatus];
  const statusLabel = playStatusLabelMap[game.playStatus];

  return (
    <Link href={`/game/${game.id}`}>
      <div className="flex items-center gap-4 p-3 rounded-lg border border-purple-500/10 bg-slate-900/80 hover:border-purple-500/40 transition-all hover:shadow-md hover:shadow-purple-500/5 cursor-pointer">
        {/* Thumbnail */}
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
          {game.coverUrl ? (
            <Image
              src={game.coverUrl}
              alt={game.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <span className="text-lg">🎮</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate-100 truncate">{game.title}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            {game.platforms.map((p) => (
              <span key={p} title={platformLabelMap[p]} className="text-sm">
                {platformIconMap[p]}
              </span>
            ))}
          </div>
        </div>

        {/* Status badge */}
        <Badge className={cn('text-xs text-white shrink-0', statusColor)}>
          {statusLabel}
        </Badge>

        {/* Rating */}
        {game.personalRating > 0 && (
          <span className="text-sm text-yellow-400 shrink-0">⭐ {game.personalRating}</span>
        )}
      </div>
    </Link>
  );
}