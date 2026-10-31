'use client';

import { useEffect, useState } from 'react';

import { PublicAvailability } from '@/features/availability/types/availability.types';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { WEEK_DISPLAY_ORDER } from '@/shared/const/week.const';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

// Stored zones are not always valid IANA names (e.g. "Tbilisi"); an unknown zone compares by name instead.
const zoneOffset = (timeZone: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value;
  } catch {
    return timeZone.split('/').pop();
  }
};

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

  if (!loaded) return <Skeleton className="h-48" />;
  if (!availability || availability.weekly.every((entry) => entry.intervals.length === 0)) {
    return <p className="text-sm text-muted-foreground">{t.profile.hoursMissing}</p>;
  }

  const sameClock =
    zoneOffset(viewer.timezone) === zoneOffset(availability.timezone) || viewer.timezone.endsWith(availability.timezone);

  return (
    <div>
      <ul className="divide-y divide-rule rounded-lg paper">
        {WEEK_DISPLAY_ORDER.map((index) => {
          const day = t.weekdaysLong[index];
          const entry = availability.weekly.find((item) => item.day === index);
          const hours = entry?.intervals.map((interval) => `${interval.start} – ${interval.end}`).join(', ');
          const isToday = index === viewer.today;
          return (
            <li key={day} className={cn('flex items-center justify-between gap-4 px-4 py-2.5 text-sm', isToday && 'bg-mark/5')}>
              <span className="font-medium">
                {day}
                {isToday && <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-ink">{t.common.today}</span>}
              </span>
              <span className={cn('text-right tabular-nums', hours ? 'font-medium text-ink' : 'text-muted-foreground')}>
                {hours || t.profile.notAvailable}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        {fmt(t.profile.timesIn, { zone: availability.timezone.replace('_', ' ') })}
        {!sameClock && ` · ${fmt(t.profile.youAreIn, { zone: viewer.timezone.replace('_', ' ') })}`}
      </p>
    </div>
  );
};
