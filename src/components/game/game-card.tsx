'use client';

import { PlayStatus, type Game, platformIconMap, platformLabelMap, playStatusLabelMap, playStatusColorMap } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const statusColor = playStatusColorMap[game.playStatus];
  const statusLabel = playStatusLabelMap[game.playStatus];

  return (
    <Link href={`/game/${game.id}`}>
      <Card className="group overflow-hidden border-purple-500/10 bg-slate-900/80 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10">
        <div className="relative aspect-[3/4] overflow-hidden">
          {game.coverUrl ? (
            <Image
              src={game.coverUrl}
              alt={game.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-800">
              <span className="text-4xl">🎮</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={cn('text-xs text-white', statusColor)}>
              {statusLabel}
            </Badge>
          </div>
          {game.personalRating > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs bg-slate-900/80 text-yellow-400 border-0">
                ⭐ {game.personalRating}/10
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm text-slate-100 truncate">{game.title}</h3>
          <div className="flex items-center gap-1 mt-1">
            {game.platforms.map((p) => (
              <span key={p} title={platformLabelMap[p]} className="text-sm">
                {platformIconMap[p]}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}