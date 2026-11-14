'use client';

import { X } from 'lucide-react';

import { TEACHER_FILTER_KEYS, type TeacherFilterKey, type TeacherFilterValues } from '@/features/discovery/hooks/use-teacher-search';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type ActiveFilterChipsProps = {
  values: TeacherFilterValues;
  onRemove: (key: TeacherFilterKey) => void;
};

// Every active filter as a chip that removes itself in one tap.
export const ActiveFilterChips = ({ values, onRemove }: ActiveFilterChipsProps) => {
  const { t, fmt, subject } = useT();

  const label = (key: TeacherFilterKey, value: string) => {
    switch (key) {
      case 'search':
        return `“${value}”`;
      case 'subject':
        return subject(value);
      case 'day':
        return value === 'today' ? t.common.today : t.weekdaysLong[Number(value)];
      case 'maxPrice':
        return fmt(t.lessons.upTo, { price: value });
      case 'format':
        return t.lessons.formats[value] ?? value;
      case 'area':
        return t.lessons.areas[value] ?? value;
      case 'minExperience':
        return fmt(t.experienceOptions.years, { count: value });
      case 'minRating':
        return fmt(t.ratingOptions.stars, { count: value });
      default:
        return value;
    }
  };

  const active = TEACHER_FILTER_KEYS.filter((key) => key !== 'sort' && values[key]);
  if (active.length === 0) return null;

  return (
    <ul aria-label={t.discovery.activeFilters} className="flex flex-wrap gap-2">
      {active.map((key) => {
        const text = label(key, values[key]);
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onRemove(key)}
              aria-label={fmt(t.discovery.removeFilter, { filter: text })}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none',
                'transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60'
              )}
            >
              {text}
              <X className="size-3.5 text-muted-foreground" aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
};
