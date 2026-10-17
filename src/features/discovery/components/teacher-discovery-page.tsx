'use client';

import { SearchX } from 'lucide-react';

import { TeacherCard } from '@/features/discovery/components/teacher-card';
import { TeacherFilters } from '@/features/discovery/components/teacher-filters';
import { useTeacherSearch } from '@/features/discovery/hooks/use-teacher-search';
import { Button } from '@/shared/components/ui/button';
import { NativeSelect } from '@/shared/components/ui/native-select';
import { TEACHER_SORTS } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';

export const TeacherDiscoveryPage = () => {
  const { values, page, totalPages, result, loading, error, update, clear, activeCount } = useTeacherSearch();
  const total = result?.total ?? 0;
  const { t, fmt, plural, subject } = useT();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">
        {values.subject ? fmt(t.discovery.subjectTitle, { subject: subject(values.subject) }) : t.discovery.title}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {t.discovery.lead}
      </p>

      <div className="mt-6">
        <TeacherFilters values={values} activeCount={activeCount} onChange={update} onClear={clear} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {loading ? t.discovery.searching : fmt(t.discovery.available, { count: plural(t.common.tutors, total) })}
        </p>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          {t.discovery.sortBy}
          <NativeSelect
            value={values.sort || 'recommended'}
            onChange={(event) => update({ sort: event.target.value === 'recommended' ? '' : event.target.value })}
            className="h-8 w-44 text-foreground"
          >
            {TEACHER_SORTS.map((sort) => <option key={sort} value={sort}>{t.sorts[sort]}</option>)}
          </NativeSelect>
        </label>
      </div>

      {error && <p className="mt-6 text-sm text-destructive">{t.discovery.loadError}</p>}

      {loading && !result ? (
        <div className="mt-4 space-y-3" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex gap-4 rounded-xl border border-border p-5">
              <span className="size-24 shrink-0 animate-pulse rounded-full bg-muted" />
              <span className="flex-1 space-y-3">
                <span className="block h-5 w-48 animate-pulse rounded bg-muted" />
                <span className="block h-4 w-full max-w-md animate-pulse rounded bg-muted" />
                <span className="block h-4 w-64 animate-pulse rounded bg-muted" />
              </span>
            </div>
          ))}
        </div>
      ) : result && result.items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-heading text-lg font-semibold">{t.discovery.emptyTitle}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{t.discovery.emptyText}</p>
          {activeCount > 0 && <Button type="button" variant="outline" onClick={clear}>{t.discovery.clearAll}</Button>}
        </div>
      ) : (
        <div className={loading ? 'mt-4 space-y-3 opacity-60 transition-opacity' : 'mt-4 space-y-3 transition-opacity'}>
          {result?.items.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
        </div>
      )}

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
    </main>
  );
};
