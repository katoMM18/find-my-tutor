'use client';

import { BadgeCheck, Heart, MessageCircle, Search, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';

import { WeekCells } from '@/features/discovery/components/week-cells';
import { useResponseTime } from '@/features/discovery/hooks/use-response-time';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { useShortlistTeachers } from '@/features/shortlist/hooks/use-shortlist-teachers';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';
import { firstName } from '@/shared/utils/format';

type Row = {
  label: string;
  cell: (teacher: PublicTeacher) => ReactNode;
  // Which tutor wins this row, if the row has a clear "better".
  best?: (teachers: PublicTeacher[]) => string | null;
};

const bestBy = (teachers: PublicTeacher[], value: (teacher: PublicTeacher) => number | null, lowerWins: boolean) => {
  const ranked = teachers.filter((teacher) => value(teacher) !== null);
  if (ranked.length < 2) return null;
  const sorted = [...ranked].sort((a, b) => ((value(a) ?? 0) - (value(b) ?? 0)) * (lowerWins ? 1 : -1));
  // A tie is not a win.
  return value(sorted[0]) === value(sorted[1]) ? null : sorted[0].id;
};

// Saved tutors side by side: one column per tutor, the best value in each row marked.
export const ShortlistCompare = () => {
  const { teachers, count, loading, remove, clear } = useShortlistTeachers();
  const { t, fmt, plural, subject } = useT();
  const responseTime = useResponseTime();

  const rows: Row[] = [
    {
      label: t.lessons.price,
      cell: (teacher) => (teacher.pricePerLesson !== null ? fmt(t.lessons.pricePerLesson, { price: teacher.pricePerLesson }) : '—'),
      best: (list) => bestBy(list, (teacher) => teacher.pricePerLesson, true),
    },
    {
      label: t.discovery.rating,
      cell: (teacher) =>
        teacher.rating !== null ? `${teacher.rating.toFixed(1)} · ${plural(t.match.reasons.reviews, teacher.reviewCount)}` : t.shortlist.noReviews,
      best: (list) => bestBy(list, (teacher) => (teacher.reviewCount > 0 ? teacher.rating : null), false),
    },
    {
      label: t.discovery.experience,
      cell: (teacher) => (teacher.experienceYears > 0 ? fmt(t.discovery.yearsTeaching, { count: teacher.experienceYears }) : t.discovery.newToTeaching),
      best: (list) => bestBy(list, (teacher) => teacher.experienceYears, false),
    },
    {
      label: t.shortlist.replies,
      cell: (teacher) => responseTime(teacher.responseMinutes) ?? '—',
      best: (list) => bestBy(list, (teacher) => teacher.responseMinutes, true),
    },
    {
      label: t.shortlist.teachesOn,
      cell: (teacher) => <WeekCells days={teacher.availableDays} />,
    },
    {
      label: t.shortlist.where,
      cell: (teacher) =>
        [...teacher.lessonFormats.map((format) => t.lessons.formats[format]), ...teacher.areas.map((area) => t.lessons.areas[area])].join(', '),
    },
    {
      label: t.shortlist.subjects,
      cell: (teacher) => teacher.subjects.map(subject).join(', '),
    },
    {
      label: t.shortlist.diploma,
      cell: (teacher) =>
        teacher.verified ? (
          <span className="inline-flex items-center gap-1.5 font-medium">
            <BadgeCheck className="size-4 text-primary" aria-hidden="true" /> {t.shortlist.checked}
          </span>
        ) : '—',
    },
  ];

  if (!loading && count === 0) {
    return (
      <div className="paper mx-auto max-w-xl rounded-xl p-8 text-center">
        <Heart className="mx-auto size-8 text-primary" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">{t.shortlist.emptyTitle}</h2>
        <p className="mt-2 text-muted-foreground">{t.shortlist.emptyText}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild><Link href="/teachers"><Search className="size-4" aria-hidden="true" /> {t.profile.browseTutors}</Link></Button>
          <Button asChild variant="outline"><Link href="/match"><Sparkles className="size-4" aria-hidden="true" /> {t.match.cta}</Link></Button>
        </div>
      </div>
    );
  }

  if (loading && teachers.length === 0) {
    return (
      <div aria-busy="true" className="paper grid gap-4 rounded-xl p-6 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-64" />)}
      </div>
    );
  }

  const winners = new Map(rows.map((row) => [row.label, row.best?.(teachers) ?? null]));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" aria-live="polite">{plural(t.common.tutors, teachers.length)}</p>
        <Button type="button" variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">{t.shortlist.clearAll}</Button>
      </div>

      <div className="paper overflow-x-auto rounded-xl">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{t.shortlist.compareCaption}</caption>
          <thead>
            <tr className="border-b border-rule align-top">
              <th scope="col" className="sticky left-0 z-10 w-36 min-w-32 bg-card p-4 font-semibold text-muted-foreground">
                <span className="sr-only">{t.shortlist.tutor}</span>
              </th>
              {teachers.map((teacher) => (
                <th key={teacher.id} scope="col" className="min-w-56 p-4 font-normal">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/teachers/${teacher.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-lg outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
                    >
                      <UserAvatar name={teacher.name} src={teacher.avatar} size="lg" className="shrink-0 rounded-sm shadow-sm ring-2 ring-white" />
                      <span className="min-w-0 font-heading text-lg font-extrabold leading-tight tracking-tight">{teacher.name}</span>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(teacher.id)}
                      aria-label={fmt(t.shortlist.unsaveName, { name: teacher.name })}
                      className="-mr-2 -mt-1 shrink-0 text-muted-foreground"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((row) => (
              <tr key={row.label} className="align-top">
                <th scope="row" className="sticky left-0 z-10 bg-card p-4 font-semibold text-muted-foreground">{row.label}</th>
                {teachers.map((teacher) => {
                  const best = winners.get(row.label) === teacher.id;
                  return (
                    <td key={teacher.id} className={cn('p-4', best && 'font-semibold')}>
                      {row.cell(teacher)}
                      {best && <Badge variant="soft" className="ml-2">{t.shortlist.best}</Badge>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-card p-4"><span className="sr-only">{t.common.message}</span></th>
              {teachers.map((teacher) => (
                <td key={teacher.id} className="p-4">
                  <Button asChild className="w-full">
                    <Link href={`/teachers/${teacher.id}#message`}>
                      <MessageCircle className="size-4" aria-hidden="true" /> {fmt(t.profile.messageName, { name: firstName(teacher.name) })}
                    </Link>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
