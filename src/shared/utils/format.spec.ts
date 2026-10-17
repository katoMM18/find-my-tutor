import { describe, it, expect } from 'vitest';

import { capitalize, formatDate, formatRelativeTime, formatWeekdays, truncate } from './format';

describe('formatDate', () => {
  it('formats a date object', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    const result = formatDate(date, 'en-US');
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
  });

  it('formats a date string', () => {
    const result = formatDate('2024-06-01', 'en-US');
    expect(result).toContain('2024');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    const result = truncate('Hello World', 5);
    expect(result).toBe('Hello...');
  });

  it('returns original if within limit', () => {
    const result = truncate('Hi', 10);
    expect(result).toBe('Hi');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('lowercases rest', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-10T12:00:00Z');

  it('uses the requested locale', () => {
    expect(formatRelativeTime(new Date('2026-01-10T11:55:00Z'), 'en-US', now)).toContain('5');
    expect(formatRelativeTime(new Date('2026-01-10T11:55:00Z'), 'ka-GE', now)).not.toContain('ago');
  });
});

describe('formatWeekdays', () => {
  const labels = { short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], everyDay: 'every day', weekdays: 'Mon–Fri' };

  it('collapses common patterns', () => {
    expect(formatWeekdays([0, 1, 2, 3, 4, 5, 6], labels)).toBe('every day');
    expect(formatWeekdays([5, 1, 2, 3, 4], labels)).toBe('Mon–Fri');
    expect(formatWeekdays([1, 3], labels)).toBe('Mon, Wed');
  });
});
