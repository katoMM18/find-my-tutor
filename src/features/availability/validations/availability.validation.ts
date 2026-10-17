import { z } from 'zod';

const TimeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

const hasValidRanges = (ranges: { start: string; end: string }[]) => {
  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
  return sorted.every((range, index) => {
    if (range.start >= range.end) return false;
    return index === 0 || sorted[index - 1].end <= range.start;
  });
};

const rangesValidation = (ranges: { start: string; end: string }[]) =>
  hasValidRanges(ranges);

export const AvailabilitySchema = z.object({
  timezone: z.string().min(1).max(100),
  weekly: z
    .array(
      z.object({
        day: z.number().int().min(0).max(6),
        intervals: z.array(TimeRangeSchema).max(12),
      })
    )
    .max(7)
    .superRefine((weekly, context) => {
      const days = new Set<number>();
      weekly.forEach((entry, index) => {
        if (days.has(entry.day)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'day'],
            message: 'Each weekday can appear only once.',
          });
        }
        days.add(entry.day);
        if (!rangesValidation(entry.intervals)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'intervals'],
            message: 'Intervals must be ordered, valid, and non-overlapping.',
          });
        }
      });
    }),
  exceptions: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        isAvailable: z.boolean(),
        intervals: z.array(TimeRangeSchema).max(12),
      })
    )
    .max(100)
    .superRefine((exceptions, context) => {
      const dates = new Set<string>();
      exceptions.forEach((entry, index) => {
        if (dates.has(entry.date)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'date'],
            message: 'Each exception date can appear only once.',
          });
        }
        dates.add(entry.date);
        if (entry.isAvailable && !rangesValidation(entry.intervals)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'intervals'],
            message: 'Intervals must be ordered, valid, and non-overlapping.',
          });
        }
      });
    }),
});

export type AvailabilityInput = z.infer<typeof AvailabilitySchema>;
