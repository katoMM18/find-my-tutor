'use client';

import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type InkMarkProps = {
  rating: number | null;
  count: number;
  size?: 'md' | 'lg';
  // Stagger slot so several marks on one wall are circled one after another.
  inkDelay?: 0 | 1 | 2 | 3;
  className?: string;
};

const MARK_SIZES = {
  md: 'px-3 py-1 text-2xl',
  lg: 'px-4 py-1.5 text-4xl',
} as const;

const INK_DELAYS = ['', 'animate-ink-1', 'animate-ink-2', 'animate-ink-3'] as const;

// A rating circled in red marker on the flyer. The circle draws itself once; the number never changes.
export const InkMark = ({ rating, count, size = 'md', inkDelay = 0, className }: InkMarkProps) => {
  const { t, fmt, plural } = useT();

  if (rating === null || count === 0) {
    return <span className={cn('whitespace-nowrap text-sm text-muted-foreground', className)}>{t.common.newTutor}</span>;
  }

  return (
    <span className={cn('inline-flex flex-col items-center', className)}>
      <span className={cn('relative inline-flex items-center justify-center', MARK_SIZES[size])}>
        <svg aria-hidden="true" viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible text-mark">
          <path
            pathLength={1}
            d="M16 34C9 16 46 4 79 9c20 4 20 37-14 45-29 6-58-2-56-22 1-11 15-19 31-21"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={cn('animate-marker', INK_DELAYS[inkDelay])}
          />
        </svg>
        <span
          aria-label={fmt(t.reviews.outOf, { value: rating.toFixed(1) })}
          className="relative font-heading font-extrabold leading-none tracking-tight text-mark tabular-nums"
        >
          {rating.toFixed(1)}
        </span>
      </span>
      <span className="mt-1 whitespace-nowrap text-xs text-muted-foreground">{plural(t.common.reviews, count)}</span>
    </span>
  );
};
