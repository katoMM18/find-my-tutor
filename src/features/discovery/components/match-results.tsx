'use client';

import { Megaphone, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';

import { MatchReasons } from '@/features/discovery/components/match-reasons';
import { TeacherCard } from '@/features/discovery/components/teacher-card';
import { TutorMatchResult } from '@/features/discovery/types/teacher-discovery.types';
import { MatchType } from '@/features/discovery/validations/match.validation';
import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';
import { firstName } from '@/shared/utils/format';

type MatchResultsProps = {
  result: TutorMatchResult;
  answers: MatchType;
  onRestart: () => void;
};

// Builds a query string from the answers, leaving out anything not chosen.
const toQuery = (entries: Record<string, string | number | null | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(entries).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString();
};

export const MatchResults = ({ result, answers, onRestart }: MatchResultsProps) => {
  const { t, fmt, subject } = useT();
  const requestHref = `/requests?${toQuery({
    subject: answers.subject,
    goal: answers.goal,
    format: answers.format,
    area: answers.format !== 'online' ? answers.area : null,
    budget: answers.budget,
    note: answers.days.length ? fmt(t.match.requestNoteDays, { days: answers.days.map((day) => t.weekdaysLong[day]).join(', ') }) : null,
  })}`;
  const browseHref = `/teachers?${toQuery({
    subject: answers.subject,
    maxPrice: answers.budget,
    format: answers.format,
    area: answers.format !== 'online' ? answers.area : null,
  })}`;

  if (result.matches.length === 0) {
    return (
      <div className="paper mx-auto w-full max-w-2xl rounded-xl p-6 sm:p-8">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight">{fmt(t.match.noneTitle, { subject: subject(answers.subject) })}</h2>
        <p className="mt-2 max-w-lg text-muted-foreground">{t.match.noneText}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href={requestHref}><Megaphone className="size-4" aria-hidden="true" /> {t.match.postRequest}</Link>
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onRestart}>
            <RotateCcw className="size-4" aria-hidden="true" /> {t.match.restart}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">{t.match.resultsTitle}</h2>
          <p className="mt-3 text-muted-foreground">
            {fmt(t.match.resultsLead, { count: result.matches.length, total: result.considered, subject: subject(answers.subject) })}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onRestart}>
          <RotateCcw className="size-4" aria-hidden="true" /> {t.match.restart}
        </Button>
      </div>

      <ol className="pin-drop mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        {result.matches.map((match, index) => (
          <li key={match.teacher.id} className="flex min-w-0 flex-col gap-3">
            <div className="rounded-lg bg-card/60 p-4">
              <p className="text-sm font-semibold text-muted-foreground">
                {index === 0 ? t.match.bestFit : fmt(t.match.whyName, { name: firstName(match.teacher.name) })}
              </p>
              <MatchReasons reasons={match.reasons} className="mt-2" />
            </div>
            <TeacherCard teacher={match.teacher} inkDelay={Math.min(index, 3) as 0 | 1 | 2 | 3} />
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col gap-3 rounded-xl border-2 border-dashed border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t.match.notQuite}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={browseHref}><Search className="size-4" aria-hidden="true" /> {t.match.browseAll}</Link>
          </Button>
          <Button asChild>
            <Link href={requestHref}><Megaphone className="size-4" aria-hidden="true" /> {t.match.postRequest}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
