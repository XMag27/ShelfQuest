'use client';

import { PlayStatus, CompletionStatus, playStatusLabelMap, completionStatusLabelMap, playStatusColorMap } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeType = PlayStatus | CompletionStatus;

interface StatusBadgeProps {
  status: BadgeType;
  className?: string;
}

const completionColorMap: Record<CompletionStatus, string> = {
  [CompletionStatus.mainStory]: 'bg-cyan-500',
  [CompletionStatus.completionist]: 'bg-orange-500',
  [CompletionStatus.hundredPercent]: 'bg-emerald-500',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isPlayStatus = Object.values(PlayStatus).includes(status as PlayStatus);

  const label = isPlayStatus
    ? playStatusLabelMap[status as PlayStatus]
    : completionStatusLabelMap[status as CompletionStatus];

  const colorClass = isPlayStatus
    ? playStatusColorMap[status as PlayStatus]
    : completionColorMap[status as CompletionStatus];

  return (
    <Badge className={cn('text-xs text-white', colorClass, className)}>
      {label}
    </Badge>
  );
}