'use client';

import { useT } from '@/shared/hooks/use-t';

// "15 min", "2 hours", "a day": how quickly a tutor usually replies, rounded the way people say it.
export const useResponseTime = () => {
  const { t, fmt, plural } = useT();

  return (minutes: number | null) => {
    if (minutes === null) return null;
    if (minutes < 60) return fmt(t.lessons.responseMinutes, { count: Math.max(5, Math.ceil(minutes / 5) * 5) });
    if (minutes < 24 * 60) return plural(t.lessons.responseHours, Math.ceil(minutes / 60));
    return t.lessons.responseDay;
  };
};
