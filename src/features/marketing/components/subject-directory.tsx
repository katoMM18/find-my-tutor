'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { PAPER_BY_CATEGORY, DEFAULT_PAPER } from '@/shared/const/paper.const';
import { SUBJECT_CATALOG } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type SubjectDirectoryProps = {
  counts: Record<string, number>;
};

// Every subject, grouped on its own colour of paper, each one a link with the number of tutors behind it.
export const SubjectDirectory = ({ counts }: SubjectDirectoryProps) => {
  const { t, plural, subject } = useT();

  return (
    <section aria-labelledby="subjects-heading" className="px-4 pt-20 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <h2 id="subjects-heading" className="font-heading text-3xl font-extrabold sm:text-4xl">{t.home.subjectsTitle}</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{t.home.subjectsLead}</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {SUBJECT_CATALOG.map((category) => (
            <section
              key={category.label}
              aria-label={t.subjectCategories[category.label] ?? category.label}
              className={cn('paper rounded-lg p-5', PAPER_BY_CATEGORY[category.label] ?? DEFAULT_PAPER)}
            >
              <h3 className="text-lg font-bold">{t.subjectCategories[category.label] ?? category.label}</h3>
              <ul className="mt-3 divide-y divide-dashed divide-foreground/15">
                {category.subjects.map((item) => {
                  const count = counts[item] ?? 0;
                  return (
                    <li key={item}>
                      <Link
                        href={`/teachers?subject=${encodeURIComponent(item)}`}
                        className="group flex items-center justify-between gap-3 py-2 text-sm font-medium outline-none hover:underline focus-visible:underline"
                      >
                        <span className="min-w-0 break-words">{subject(item)}</span>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums">
                          {count > 0 ? plural(t.common.tutors, count) : t.home.subjectAsk}
                          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};
