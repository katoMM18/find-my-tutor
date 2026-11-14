import { describe, expect, it } from 'vitest';

import { nextFreeSlot } from './availability';

// Wednesday 2026-11-11, 14:30 in Tbilisi (UTC+4).
const NOW = new Date('2026-11-11T10:30:00Z');

const week = [
  { day: 3, intervals: [{ start: '09:00', end: '10:00' }, { start: '17:00', end: '18:00' }] },
  { day: 5, intervals: [{ start: '12:00', end: '13:00' }] },
];

describe('nextFreeSlot', () => {
  it('returns the next opening later today', () => {
    expect(nextFreeSlot(week, 'Asia/Tbilisi', NOW)).toEqual({ inDays: 0, day: 3, start: '17:00' });
  });

  it('skips openings that already started and looks ahead', () => {
    const late = new Date('2026-11-11T14:00:00Z'); // 18:00 in Tbilisi
    expect(nextFreeSlot(week, 'Asia/Tbilisi', late)).toEqual({ inDays: 2, day: 5, start: '12:00' });
  });

  it('wraps around the week', () => {
    const saturday = new Date('2026-11-14T10:00:00Z');
    expect(nextFreeSlot(week, 'Asia/Tbilisi', saturday)).toEqual({ inDays: 4, day: 3, start: '09:00' });
  });

  it('falls back to Tbilisi time for an unknown zone and returns null without hours', () => {
    expect(nextFreeSlot(week, 'Tbilisi', NOW)).toEqual({ inDays: 0, day: 3, start: '17:00' });
    expect(nextFreeSlot([], 'Asia/Tbilisi', NOW)).toBeNull();
  });
});
