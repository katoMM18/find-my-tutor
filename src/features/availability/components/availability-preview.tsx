'use client';

import { useEffect, useState } from 'react';

import { PublicAvailability } from '@/features/availability/types/availability.types';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

type AvailabilityPreviewProps = {
  teacherProfileId: string;
};

export const AvailabilityPreview = ({ teacherProfileId }: AvailabilityPreviewProps) => {
  const { t, fmt } = useT();
  const [availability, setAvailability] = useState<PublicAvailability | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [viewer] = useState(() => ({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    today: new Date().getDay(),
  }));

  useEffect(() => {
    void http
      .get<PublicAvailability>(`/teachers/${teacherProfileId}/availability`)
      .then((result) => setAvailability('timezone' in result ? result : null))
      .catch(() => setAvailability(null))
      .finally(() => setLoaded(true));
  }, [teacherProfileId]);

  if (!loaded) return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  if (!availability || availability.weekly.every((entry) => entry.intervals.length === 0)) {
    return <p className="text-sm text-muted-foreground">{t.profile.hoursMissing}</p>;
  }

  return (
    <div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {t.weekdaysLong.map((day, index) => {
          const entry = availability.weekly.find((item) => item.day === index);
          const hours = entry?.intervals.map((interval) => `${interval.start} – ${interval.end}`).join(', ');
          return (
            <li key={day} className={cn('flex items-center justify-between gap-4 px-4 py-2.5 text-sm', index === viewer.today && 'bg-primary/5')}>
              <span className="font-medium">
                {day}
                {index === viewer.today && <span className="ml-2 text-xs font-semibold text-primary">{t.common.today}</span>}
              </span>
              <span className={cn('text-right tabular-nums', hours ? 'text-foreground' : 'text-muted-foreground')}>
                {hours || t.profile.notAvailable}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        {fmt(t.profile.timesIn, { zone: availability.timezone.replace('_', ' ') })}
        {viewer.timezone !== availability.timezone && ` · ${fmt(t.profile.youAreIn, { zone: viewer.timezone.replace('_', ' ') })}`}
      </p>
    </div>
  );
};
