'use client';

import { useSyncExternalStore } from 'react';

import { WEEK_DISPLAY_ORDER } from '@/shared/const/week.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';
import { formatWeekdays } from '@/shared/utils/format';

const subscribeToNothing = () => () => undefined;

type WeekCellsProps = {
  days: number[];
  className?: string;
};

// Availability at a glance: one chip per weekday, Monday first; teaching days are tinted in the stairwell paint colour.
export const WeekCells = ({ days, className }: WeekCellsProps) => {
  const { t, fmt } = useT();
  // Read on the client only: the server's clock and timezone must not decide which column is today.
  const today = useSyncExternalStore(subscribeToNothing, () => new Date().getDay(), () => null);
  const summary = formatWeekdays(days, { short: t.weekdaysShort, everyDay: t.discovery.everyDay, weekdays: t.discovery.weekdays });

  return (
    <span
      role="img"
      aria-label={summary ? fmt(t.discovery.teaches, { days: summary }) : t.discovery.notTeaching}
      className={cn('week-fill inline-flex gap-0.5 sm:gap-1', className)}
    >
      {WEEK_DISPLAY_ORDER.map((day) => {
        const teaches = days.includes(day);
        return (
          <span
            key={day}
            className={cn(
              'flex size-7 items-center justify-center rounded-md text-xs leading-none sm:size-8',
              teaches ? 'bg-primary/12 font-semibold text-primary' : 'text-muted-foreground/70',
              day === today && 'ring-2 ring-primary/60'
            )}
          >
            {t.weekdaysShort[day].slice(0, 2)}
          </span>
        );
      })}
    </span>
  );
};
