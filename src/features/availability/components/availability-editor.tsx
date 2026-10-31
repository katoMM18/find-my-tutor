'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AvailabilityInput, AvailabilitySchema } from '@/features/availability/validations/availability.validation';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { TIMEZONE_OPTIONS } from '@/shared/const/timezone.const';
import { WEEK_DISPLAY_ORDER } from '@/shared/const/week.const';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

const DEFAULT_RANGE = { start: '10:00', end: '18:00' };

const emptyWeek = () => Array.from({ length: 7 }, (_, day) => ({ day, intervals: [] as { start: string; end: string }[] }));

export const AvailabilityEditor = () => {
  const { t, fmt } = useT();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const form = useForm<AvailabilityInput>({
    resolver: zodResolver(AvailabilitySchema),
    defaultValues: { timezone: 'UTC', weekly: emptyWeek(), exceptions: [] },
  });
  const weekly = useWatch({ control: form.control, name: 'weekly' }) ?? emptyWeek();
  const timezone = useWatch({ control: form.control, name: 'timezone' });

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
    WEEK_DISPLAY_ORDER.forEach((target) => {
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
      <div className="max-w-sm space-y-2">
        <Label htmlFor="availability-timezone">{t.availability.timezone}</Label>
        <Select value={timezone} onValueChange={(value) => form.setValue('timezone', value, { shouldDirty: true })}>
          <SelectTrigger id="availability-timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((timezone) => <SelectItem key={timezone} value={timezone}>{timezone.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <ul className="paper divide-y divide-rule rounded-xl">
        {WEEK_DISPLAY_ORDER.map((day) => {
          const range = weekly[day]?.intervals[0];
          const enabled = Boolean(range);
          return (
            <li key={day} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Label className="flex w-36 cursor-pointer items-center gap-3">
                <Checkbox checked={enabled} onCheckedChange={(checked) => setDay(day, checked === true ? [DEFAULT_RANGE] : [])} />
                {t.weekdaysLong[day]}
              </Label>
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
