'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { TeacherFilters } from '@/features/discovery/components/teacher-filters';
import { TeacherRegister } from '@/features/discovery/components/teacher-register';
import { useTeacherSearch } from '@/features/discovery/hooks/use-teacher-search';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { TEACHER_SORTS } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

export const TeacherDiscoveryPage = () => {
  const { values, page, totalPages, result, loading, error, update, clear, retry, activeCount } = useTeacherSearch();
  const [filtersKey, setFiltersKey] = useState(0);
  const total = result?.total ?? 0;
  const { t, fmt, plural, subject } = useT();

  const clearAll = () => {
    clear();
    setFiltersKey((key) => key + 1);
  };

  return (
    <main className="flex-1">
      <section className="px-4 pb-8 pt-10 sm:px-8 sm:pt-14">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="font-heading text-5xl font-extrabold leading-none sm:text-6xl">
            {values.subject ? fmt(t.discovery.subjectTitle, { subject: subject(values.subject) }) : t.discovery.title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.discovery.lead}</p>
        </div>
      </section>

      <div className="px-4 pb-16 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="paper rounded-xl p-3 sm:p-4">
            <TeacherFilters key={filtersKey} values={values} onChange={update} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold" aria-live="polite">
                {loading ? t.discovery.searching : fmt(t.discovery.available, { count: plural(t.common.tutors, total) })}
              </h2>
              {activeCount > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                  <X className="size-4" aria-hidden="true" />
                  {t.common.clear}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span id="sort-label">{t.discovery.sortBy}</span>
              <Select value={values.sort || 'recommended'} onValueChange={(value) => update({ sort: value === 'recommended' ? '' : value })}>
                <SelectTrigger aria-labelledby="sort-label" className="h-9 w-44 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {TEACHER_SORTS.map((sort) => <SelectItem key={sort} value={sort}>{t.sorts[sort]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3">
            {error ? (
              <Alert variant="destructive" className="py-5 sm:flex-row sm:items-center sm:justify-between">
                <AlertDescription className="text-base text-foreground">{t.discovery.loadError}</AlertDescription>
                <Button type="button" variant="outline" onClick={retry}>{t.common.tryAgain}</Button>
              </Alert>
            ) : loading && !result ? (
              <div aria-busy="true" className="divide-y divide-rule rounded-lg paper pl-2">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex gap-4 px-6 py-5">
                    <Skeleton className="size-20 shrink-0" />
                    <span className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full max-w-md" />
                      <Skeleton className="h-8 w-56" />
                    </span>
                  </div>
                ))}
              </div>
            ) : result && result.items.length === 0 ? (
              <div className="paper rounded-xl p-8">
                <p className="text-lg font-bold ">{t.discovery.emptyTitle}</p>
                <p className="max-w-md  text-muted-foreground">{t.discovery.emptyText}</p>
                {activeCount > 0 && <Button type="button" variant="outline" onClick={clearAll} className="mt-4">{t.discovery.clearAll}</Button>}
              </div>
            ) : result ? (
              <TeacherRegister teachers={result.items} className={cn('transition-opacity', loading && 'opacity-60')} />
            ) : null}
          </div>

          {totalPages > 1 && (
            <nav aria-label={t.discovery.pagination} className="mt-8 flex items-center justify-center gap-3">
              <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                {t.discovery.previous}
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground">{fmt(t.discovery.pageOf, { page, total: totalPages })}</span>
              <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) })}>
                {t.discovery.next}
              </Button>
            </nav>
          )}
        </div>
      </div>
    </main>
  );
};
