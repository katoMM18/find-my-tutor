'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AreaSelect } from '@/features/discovery/components/area-select';
import { MatchResults } from '@/features/discovery/components/match-results';
import { SubjectSelect } from '@/features/discovery/components/subject-select';
import { useTutorMatch } from '@/features/discovery/hooks/use-tutor-match';
import { MatchSchema, type MatchType } from '@/features/discovery/validations/match.validation';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { LESSON_FORMATS, MAX_PRICE_FILTERS } from '@/shared/const/lesson.const';
import { REQUEST_GOALS } from '@/shared/const/requests.const';
import { ANY_FILTER_VALUE, POPULAR_SUBJECTS } from '@/shared/const/subjects.const';
import { WEEK_DISPLAY_ORDER } from '@/shared/const/week.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';
import { isLessonArea, isLessonFormat } from '@/shared/utils/lesson';

const STEPS = ['subject', 'goal', 'budget', 'where', 'days'] as const;

const chipClassName = 'h-11 px-4';

const Question = ({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) => (
  <fieldset className="animate-step">
    <legend className="font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</legend>
    {hint && <p className="mt-2 text-muted-foreground">{hint}</p>}
    <div className="mt-6">{children}</div>
  </fieldset>
);

// "Match me": five quick questions, then the three tutors who fit best and why.
export const MatchWizard = () => {
  const { t, fmt, subject: subjectName } = useT();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const { result, answers, loading, error, find, reset } = useTutorMatch();
  const formatParam = params.get('format') ?? '';
  const areaParam = params.get('area') ?? '';
  const form = useForm<MatchType>({
    resolver: zodResolver(MatchSchema),
    defaultValues: {
      subject: params.get('subject') ?? '',
      goal: 'school',
      budget: null,
      format: isLessonFormat(formatParam) ? formatParam : null,
      area: isLessonArea(areaParam) ? areaParam : null,
      days: [],
    },
  });
  const [subject, goal, budget, format, area, days] = useWatch({
    control: form.control,
    name: ['subject', 'goal', 'budget', 'format', 'area', 'days'],
  });
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  if (result && answers) {
    return (
      <MatchResults
        result={result}
        answers={answers}
        onRestart={() => {
          reset();
          setStep(0);
        }}
      />
    );
  }

  const next = () => (last ? void form.handleSubmit(find)() : setStep((value) => value + 1));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        next();
      }}
      className="paper mx-auto w-full max-w-2xl rounded-xl"
    >
      <div className="border-b border-rule p-5 sm:px-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          {fmt(t.match.stepOf, { step: step + 1, total: STEPS.length })}
        </p>
        <div
          className="mt-3 flex gap-1"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
          aria-label={fmt(t.match.stepOf, { step: step + 1, total: STEPS.length })}
        >
          {STEPS.map((item, index) => (
            <span key={item} className={cn('h-1.5 flex-1 rounded-sm transition-colors duration-300', index <= step ? 'bg-primary' : 'bg-rule')} />
          ))}
        </div>
      </div>

      <div key={current} className="min-h-80 p-5 sm:p-8">
        {current === 'subject' && (
          <Question title={t.match.subjectQuestion} hint={t.match.subjectHint}>
            <ToggleGroup
              type="single"
              variant="outline"
              value={POPULAR_SUBJECTS.includes(subject) ? subject : ''}
              onValueChange={(value) => value && form.setValue('subject', value)}
              className="flex flex-wrap justify-start gap-2"
            >
              {POPULAR_SUBJECTS.map((item) => (
                <ToggleGroupItem key={item} value={item} className={chipClassName}>{subjectName(item)}</ToggleGroupItem>
              ))}
            </ToggleGroup>
            <SubjectSelect
              value={subject}
              onChange={(value) => form.setValue('subject', value)}
              anyLabel={t.match.otherSubject}
              className="mt-4 h-12 w-full"
            />
          </Question>
        )}

        {current === 'goal' && (
          <Question title={t.match.goalQuestion}>
            <ToggleGroup
              type="single"
              variant="outline"
              value={goal}
              onValueChange={(value) => value && form.setValue('goal', value as MatchType['goal'])}
              className="flex flex-wrap justify-start gap-2"
            >
              {REQUEST_GOALS.map((item) => (
                <ToggleGroupItem key={item} value={item} className={chipClassName}>{t.requests.goals[item]}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Question>
        )}

        {current === 'budget' && (
          <Question title={t.match.budgetQuestion} hint={t.match.budgetHint}>
            <ToggleGroup
              type="single"
              variant="outline"
              value={budget === null ? ANY_FILTER_VALUE : String(budget)}
              onValueChange={(value) => value && form.setValue('budget', value === ANY_FILTER_VALUE ? null : Number(value))}
              className="flex flex-wrap justify-start gap-2"
            >
              {MAX_PRICE_FILTERS.map((price) => (
                <ToggleGroupItem key={price} value={price} className={chipClassName}>{fmt(t.lessons.upTo, { price })}</ToggleGroupItem>
              ))}
              <ToggleGroupItem value={ANY_FILTER_VALUE} className={chipClassName}>{t.match.anyBudget}</ToggleGroupItem>
            </ToggleGroup>
          </Question>
        )}

        {current === 'where' && (
          <Question title={t.match.whereQuestion}>
            <ToggleGroup
              type="single"
              variant="outline"
              value={format ?? ANY_FILTER_VALUE}
              onValueChange={(value) => value && form.setValue('format', isLessonFormat(value) ? value : null)}
              className="flex flex-wrap justify-start gap-2"
            >
              {LESSON_FORMATS.map((item) => (
                <ToggleGroupItem key={item} value={item} className={chipClassName}>{t.lessons.formats[item]}</ToggleGroupItem>
              ))}
              <ToggleGroupItem value={ANY_FILTER_VALUE} className={chipClassName}>{t.match.anyFormat}</ToggleGroupItem>
            </ToggleGroup>
            {format !== 'online' && (
              <AreaSelect value={area} onChange={(value) => form.setValue('area', value)} anyLabel={t.match.anyArea} className="mt-4 h-12 w-full" />
            )}
          </Question>
        )}

        {current === 'days' && (
          <Question title={t.match.daysQuestion} hint={t.match.daysHint}>
            <ToggleGroup
              type="multiple"
              variant="outline"
              value={days.map(String)}
              onValueChange={(values) => form.setValue('days', values.map(Number))}
              className="grid grid-cols-4 gap-2 sm:grid-cols-7"
            >
              {WEEK_DISPLAY_ORDER.map((day) => (
                <ToggleGroupItem key={day} value={String(day)} aria-label={t.weekdaysLong[day]} className={cn(chipClassName, 'w-full')}>
                  {t.weekdaysShort[day]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Question>
        )}

        {error && <Alert variant="destructive" className="mt-6">{t.match.error}</Alert>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-rule p-4 sm:px-8">
        <Button type="button" variant="ghost" onClick={() => setStep((value) => value - 1)} disabled={step === 0 || loading}>
          <ArrowLeft className="size-4" aria-hidden="true" /> {t.match.back}
        </Button>
        <Button type="submit" size="lg" disabled={!subject || loading}>
          {loading ? t.match.finding : last ? t.match.show : t.match.next}
          {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
      </div>
    </form>
  );
};
