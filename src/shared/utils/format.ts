export function formatDate(date: Date | string, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatRelativeTime(date: Date | string, locale = 'en-US', now = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  const minutes = Math.round((d.getTime() - now.getTime()) / 60000);
  if (Math.abs(minutes) < 1) return rtf.format(0, 'second');
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(days, 'day');
  return formatDate(d, locale);
}

export function firstName(name: string): string {
  return name.trim().split(' ')[0] ?? name;
}

type WeekdayLabels = {
  short: string[];
  everyDay: string;
  weekdays: string;
};

export function formatWeekdays(days: number[], labels: WeekdayLabels): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  if (sorted.length === 0) return '';
  if (sorted.length === 7) return labels.everyDay;
  const isWeekdays = sorted.length === 5 && sorted.every((day, index) => day === index + 1);
  if (isWeekdays) return labels.weekdays;
  return sorted.map((day) => labels.short[day]).join(', ');
}
