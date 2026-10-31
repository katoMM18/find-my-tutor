'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { POPULAR_SUBJECTS } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';

export const HomeSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { t, subject: subjectName } = useT();

  return (
    <div>
      <form
        role="search"
       
        className="paper flex flex-col gap-1.5 rounded-xl p-2 text-card-foreground sm:flex-row sm:rounded-lg"
        onSubmit={(event) => {
          event.preventDefault();
          const value = query.trim();
          router.push(value ? `/teachers?search=${encodeURIComponent(value)}` : '/teachers');
        }}
      >
        <Label className="relative flex-1">
          <span className="sr-only">{t.home.searchLabel}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.home.searchLabel}
            className="h-12 border-0 bg-transparent pl-11 text-base text-card-foreground shadow-none placeholder:text-muted-foreground
              focus-visible:ring-0 dark:bg-transparent"
          />
        </Label>
        <Button type="submit" size="lg" className="h-12 px-8 font-semibold">{t.home.searchButton}</Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{t.home.popular}</span>
        {POPULAR_SUBJECTS.map((subject) => (
          <Link
            key={subject}
            href={`/teachers?subject=${encodeURIComponent(subject)}`}
            className="paper rounded-lg px-3.5 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60
              outline-none"
          >
            {subjectName(subject)}
          </Link>
        ))}
      </div>
    </div>
  );
};
