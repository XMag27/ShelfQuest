'use client';

import { type Game, platformIconMap, platformLabelMap, playStatusLabelMap } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock } from 'lucide-react';
import { StatusBadge } from './status-badge';

interface GameListItemProps {
  game: Game;
}

export function GameListItem({ game }: GameListItemProps) {
  return (
    <Link href={`/game/${game.id}`} className="block group">
      <div className="flex items-center gap-4 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-200 cursor-pointer">
        {/* Thumbnail */}
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-600/10">
          {game.coverUrl ? (
            <Image
              src={game.coverUrl}
              alt={game.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-lg opacity-30">🎮</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate-100 truncate group-hover:text-white transition-colors">
            {game.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {game.platforms.slice(0, 3).map((p) => (
                <span key={p} title={platformLabelMap[p]} className="text-xs opacity-70">
                  {platformIconMap[p]}
                </span>
              ))}
            </div>
            {game.hoursPlayed > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {game.hoursPlayed}h
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          <StatusBadge status={game.playStatus} />
        </div>

        {/* Rating */}
        {game.personalRating > 0 && (
          <span className="flex items-center gap-0.5 text-sm text-amber-400 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            {game.personalRating}
          </span>
        )}
      </div>
    </Link>
  );
}