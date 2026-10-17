'use client';

import { Star } from 'lucide-react';

import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type StarRatingProps = {
  value: number;
  className?: string;
};

export const StarRating = ({ value, className }: StarRatingProps) => {
  const { t, fmt } = useT();

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={fmt(t.reviews.outOf, { value: value.toFixed(1) })}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            'size-3.5',
            index <= Math.round(value) ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground/40'
          )}
        />
      ))}
    </span>
  );
};

type RatingSummaryProps = {
  rating: number | null;
  count: number;
  className?: string;
};

export const RatingSummary = ({ rating, count, className }: RatingSummaryProps) => {
  const { t, plural } = useT();

  if (rating === null || count === 0) {
    return (
      <span className={cn('inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary', className)}>
        {t.common.newTutor}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <Star aria-hidden="true" className="size-4 fill-primary text-primary" />
      <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
      <span className="text-muted-foreground">({plural(t.common.reviews, count)})</span>
    </span>
  );
};
