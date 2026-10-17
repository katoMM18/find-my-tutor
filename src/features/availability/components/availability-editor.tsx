'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AvailabilityInput, AvailabilitySchema } from '@/features/availability/validations/availability.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { NativeSelect } from '@/shared/components/ui/native-select';
import { TIMEZONE_OPTIONS } from '@/shared/const/timezone.const';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

const DEFAULT_RANGE = { start: '10:00', end: '18:00' };
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const emptyWeek = () => Array.from({ length: 7 }, (_, day) => ({ day, intervals: [] as { start: string; end: string }[] }));

export const AvailabilityEditor = () => {
  const { t, fmt } = useT();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const form = useForm<AvailabilityInput>({
    resolver: zodResolver(AvailabilitySchema),
    defaultValues: { timezone: 'UTC', weekly: emptyWeek(), exceptions: [] },
  });
  const weekly = useWatch({ control: form.control, name: 'weekly' }) ?? emptyWeek();

  useEffect(() => {
    void http.get<Partial<AvailabilityInput>>('/availability/me').then((availability) => {
      const findZone = (value?: string) =>
        value ? TIMEZONE_OPTIONS.find((zone) => zone === value || zone.endsWith(`/${value}`)) : undefined;
      const timezone = findZone(availability?.timezone) ?? findZone(Intl.DateTimeFormat().resolvedOptions().timeZone) ?? 'UTC';
      form.reset({
        timezone,
        weekly: emptyWeek().map((entry) => availability?.weekly?.find((item) => item.day === entry.day) ?? entry),
        exceptions: availability?.exceptions ?? [],
      });
    });
  }, [form]);

  const setDay = (day: number, intervals: { start: string; end: string }[]) => {
    setMessage(null);
    form.setValue(`weekly.${day}.intervals`, intervals, { shouldDirty: true, shouldValidate: true });
  };

  const copyToAll = (day: number) => {
    const source = weekly[day]?.intervals ?? [];
    DISPLAY_ORDER.forEach((target) => {
      if (target !== day && weekly[target]?.intervals.length) setDay(target, source);
    });
  };

  const submit = async (data: AvailabilityInput) => {
    try {
      await http.put('/availability/me', data);
      form.reset(data);
      setMessage({ kind: 'success', text: t.availability.saved });
    } catch {
      setMessage({ kind: 'error', text: t.availability.saveError });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <label className="block max-w-sm text-sm font-medium">
        {t.availability.timezone}
        <NativeSelect {...form.register('timezone')} className="mt-2">
          {TIMEZONE_OPTIONS.map((timezone) => <option key={timezone} value={timezone}>{timezone.replace('_', ' ')}</option>)}
        </NativeSelect>
      </label>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {DISPLAY_ORDER.map((day) => {
          const range = weekly[day]?.intervals[0];
          const enabled = Boolean(range);
          return (
            <li key={day} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <label className="flex w-36 cursor-pointer items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => setDay(day, event.target.checked ? [DEFAULT_RANGE] : [])}
                  className="size-4 accent-primary"
                />
                {t.weekdaysLong[day]}
              </label>
              {range ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <Input type="time" aria-label={fmt(t.availability.start, { day: t.weekdaysLong[day] })} value={range.start} className="w-32"
                    onChange={(event) => setDay(day, [{ ...range, start: event.target.value }])} />
                  <span className="text-muted-foreground">–</span>
                  <Input type="time" aria-label={fmt(t.availability.end, { day: t.weekdaysLong[day] })} value={range.end} className="w-32"
                    onChange={(event) => setDay(day, [{ ...range, end: event.target.value }])} />
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => copyToAll(day)}>
                    <Copy className="size-3.5" aria-hidden="true" /> {t.availability.applyToOthers}
                  </Button>
                </div>
              ) : (
                <span className="flex-1 text-sm text-muted-foreground">{t.availability.notTeaching}</span>
              )}
            </li>
          );
        })}
      </ul>

      {form.formState.errors.weekly && (
        <p className="text-sm text-destructive">{t.availability.rangeError}</p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? t.availability.saving : t.availability.save}</Button>
        {message && (
          <p role="status" className={cn('flex items-center gap-1.5 text-sm', message.kind === 'success' ? 'text-primary' : 'text-destructive')}>
            {message.kind === 'success' && <CheckCircle2 className="size-4" aria-hidden="true" />}
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
};
