import { DEFAULT_TUTOR_TIMEZONE } from '@/shared/const/timezone.const';

type WeeklyEntry = { day: number; intervals: { start: string; end: string }[] };

export type NextFreeSlot = {
  // 0 = later today, 1 = tomorrow, up to 6 days ahead, all in the tutor's own time zone.
  inDays: number;
  day: number;
  start: string;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// The tutor's local weekday and HH:MM right now. Stored zones are not always valid IANA names.
function localNow(now: Date, timeZone: string): { day: number; time: string } {
  const read = (zone: string) => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(now);
    const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
    return { day: WEEKDAYS.indexOf(part('weekday')), time: `${part('hour')}:${part('minute')}` };
  };
  try {
    return read(timeZone);
  } catch {
    return read(DEFAULT_TUTOR_TIMEZONE);
  }
}

// The next weekly opening that has not started yet, looking a week ahead.
export function nextFreeSlot(weekly: WeeklyEntry[], timeZone: string | null, now: Date = new Date()): NextFreeSlot | null {
  const { day: today, time } = localNow(now, timeZone || DEFAULT_TUTOR_TIMEZONE);
  for (let inDays = 0; inDays < 7; inDays += 1) {
    const day = (today + inDays) % 7;
    const starts = weekly
      .filter((entry) => entry.day === day)
      .flatMap((entry) => entry.intervals.map((interval) => interval.start))
      .filter((start) => inDays > 0 || start > time)
      .sort();
    if (starts.length > 0) return { inDays, day, start: starts[0] };
  }
  return null;
}
