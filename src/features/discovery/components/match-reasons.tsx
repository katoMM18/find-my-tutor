'use client';

import { BadgeCheck, CalendarCheck, CalendarClock, Clock3, Gift, MapPin, Star, Wallet } from 'lucide-react';

import { useNextFreeLabel } from '@/features/discovery/hooks/use-next-free-label';
import { useResponseTime } from '@/features/discovery/hooks/use-response-time';
import { MatchReason } from '@/features/discovery/types/teacher-discovery.types';
import { WEEK_DISPLAY_ORDER } from '@/shared/const/week.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

const ICONS = {
  days: CalendarCheck,
  budget: Wallet,
  nearby: MapPin,
  fastReply: Clock3,
  rated: Star,
  verified: BadgeCheck,
  soon: CalendarClock,
  freeIntro: Gift,
} as const;

// Shown under each match: the three strongest reasons, in plain words.
const MAX_REASONS = 3;

type MatchReasonsProps = {
  reasons: MatchReason[];
  className?: string;
};

export const MatchReasons = ({ reasons, className }: MatchReasonsProps) => {
  const { t, fmt, plural } = useT();
  const responseTime = useResponseTime();
  const nextFreeLabel = useNextFreeLabel();

  const text = (reason: MatchReason) => {
    switch (reason.kind) {
      case 'days':
        return fmt(t.match.reasons.days, {
          days: WEEK_DISPLAY_ORDER.filter((day) => reason.days.includes(day)).map((day) => t.weekdaysShort[day]).join(', '),
        });
      case 'budget':
        if (reason.difference === 0) return t.match.reasons.atBudget;
        return fmt(reason.difference > 0 ? t.match.reasons.underBudget : t.match.reasons.overBudget, {
          amount: Math.abs(reason.difference),
        });
      case 'nearby':
        return fmt(t.match.reasons.nearby, { area: t.lessons.areas[reason.area] });
      case 'fastReply':
        return fmt(t.lessons.repliesWithin, { time: responseTime(reason.minutes) ?? '' });
      case 'rated':
        return fmt(t.match.reasons.rated, { rating: reason.rating.toFixed(1), reviews: plural(t.match.reasons.reviews, reason.count) });
      case 'verified':
        return t.match.reasons.verified;
      case 'soon':
        return nextFreeLabel(reason.slot);
      case 'freeIntro':
        return t.lessons.freeIntro;
    }
  };

  return (
    <ul className={cn('space-y-1.5 text-sm', className)}>
      {reasons.slice(0, MAX_REASONS).map((reason) => {
        const Icon = ICONS[reason.kind];
        const overBudget = reason.kind === 'budget' && reason.difference < 0;
        return (
          <li key={reason.kind} className={cn('flex items-center gap-2', overBudget ? 'text-muted-foreground' : 'font-medium')}>
            <Icon className={cn('size-4 shrink-0', overBudget ? 'text-muted-foreground' : 'text-primary')} aria-hidden="true" />
            {text(reason)}
          </li>
        );
      })}
    </ul>
  );
};
