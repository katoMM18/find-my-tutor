'use client';

import { Megaphone, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';

type EmptyResultsProps = {
  subject: string;
  activeCount: number;
  onClear: () => void;
};

// No tutor matches: never a dead end. Let tutors come to the student, or loosen the search.
export const EmptyResults = ({ subject, activeCount, onClear }: EmptyResultsProps) => {
  const { t, fmt, subject: subjectName } = useT();
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';

  return (
    <div className="paper rounded-xl p-6 sm:p-8">
      <p className="font-heading text-2xl font-extrabold tracking-tight">
        {subject ? fmt(t.discovery.emptySubjectTitle, { subject: subjectName(subject) }) : t.discovery.emptyTitle}
      </p>
      <p className="mt-2 max-w-lg text-muted-foreground">{t.discovery.emptyRequestText}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/requests${query}`}>
            <Megaphone className="size-4" aria-hidden="true" />
            {t.discovery.postRequest}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/match${query}`}>
            <Sparkles className="size-4" aria-hidden="true" />
            {t.match.cta}
          </Link>
        </Button>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" onClick={onClear}>{t.discovery.clearAll}</Button>
        )}
      </div>
    </div>
  );
};
