'use client';

import { PlayStatus, type Game, platformIconMap, platformLabelMap, playStatusLabelMap } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

const statusIconMap: Record<PlayStatus, string> = {
  [PlayStatus.playing]: '▶',
  [PlayStatus.completed]: '✓',
  [PlayStatus.backlog]: '⏳',
  [PlayStatus.onHold]: '⏸',
  [PlayStatus.dropped]: '✕',
  [PlayStatus.wishlist]: '♡',
};

const statusColorClasses: Record<PlayStatus, string> = {
  [PlayStatus.playing]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  [PlayStatus.completed]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [PlayStatus.backlog]: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  [PlayStatus.onHold]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [PlayStatus.dropped]: 'bg-red-500/20 text-red-300 border-red-500/30',
  [PlayStatus.wishlist]: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

export function GameCard({ game }: GameCardProps) {
  const statusLabel = playStatusLabelMap[game.playStatus];
  const statusColor = statusColorClasses[game.playStatus] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  const statusIcon = statusIconMap[game.playStatus];

  return (
    <Link href={`/game/${game.id}`} className="group block">
      <div className="game-card-hover relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
        <div className="relative aspect-[3/4] overflow-hidden">
          {game.coverUrl ? (
            <>
              <Image
                src={game.coverUrl}
                alt={game.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/40 to-transparent" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-500/10 to-indigo-600/10">
              <div className="text-5xl opacity-30">🎮</div>
            </div>
          )}

          {/* Status badge top-left */}
          <div className="absolute top-2 left-2 z-10">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm',
              statusColor
            )}>
              <span className="text-[9px]">{statusIcon}</span>
              {statusLabel}
            </span>
          </div>

          {/* Rating top-right */}
          {game.personalRating > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 backdrop-blur-sm border border-amber-500/30 text-amber-300">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {game.personalRating}
              </span>
            </div>
          )}

          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h3 className="font-semibold text-sm text-white truncate drop-shadow-lg">
              {game.title}
            </h3>
          </div>
        </div>

        {/* Platform icons */}
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {game.platforms.slice(0, 3).map((p) => (
              <span key={p} title={platformLabelMap[p]} className="text-sm opacity-70">
                {platformIconMap[p]}
              </span>
            ))}
            {game.platforms.length > 3 && (
              <span className="text-[10px] text-slate-500">+{game.platforms.length - 3}</span>
            )}
          </div>
          {game.hoursPlayed > 0 && (
            <span className="text-[10px] text-slate-500">{game.hoursPlayed}h</span>
          )}
        </div>
      </div>
    </Link>
  );
}