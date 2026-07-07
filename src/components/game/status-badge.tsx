'use client';

import { PlayStatus, CompletionStatus, playStatusLabelMap, completionStatusLabelMap } from '@/types';
import { cn } from '@/lib/utils';
import { Play, CheckCircle, Clock, PauseCircle, XCircle, Heart } from 'lucide-react';

type BadgeType = PlayStatus | CompletionStatus;

interface StatusBadgeProps {
  status: BadgeType;
  className?: string;
}

const playStatusConfig: Record<PlayStatus, { color: string; icon: React.ReactNode }> = {
  [PlayStatus.playing]: {
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: <Play className="h-3 w-3 fill-current" />,
  },
  [PlayStatus.completed]: {
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  [PlayStatus.backlog]: {
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: <Clock className="h-3 w-3" />,
  },
  [PlayStatus.onHold]: {
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: <PauseCircle className="h-3 w-3" />,
  },
  [PlayStatus.dropped]: {
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
    icon: <XCircle className="h-3 w-3" />,
  },
  [PlayStatus.wishlist]: {
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icon: <Heart className="h-3 w-3" />,
  },
};

const completionStatusConfig: Record<CompletionStatus, { color: string; icon: React.ReactNode }> = {
  [CompletionStatus.mainStory]: {
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  [CompletionStatus.completionist]: {
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  [CompletionStatus.hundredPercent]: {
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isPlayStatus = Object.values(PlayStatus).includes(status as PlayStatus);

  const label = isPlayStatus
    ? playStatusLabelMap[status as PlayStatus]
    : completionStatusLabelMap[status as CompletionStatus];

  const config = isPlayStatus
    ? playStatusConfig[status as PlayStatus]
    : completionStatusConfig[status as CompletionStatus];

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm',
      config.color,
      className
    )}>
      {config.icon}
      {label}
    </span>
  );
}