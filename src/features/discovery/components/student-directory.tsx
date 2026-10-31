'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { StudentCard } from '@/features/discovery/components/student-card';
import { StudentDiscoveryResult } from '@/features/discovery/types/student-discovery.types';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ANY_FILTER_VALUE, SUBJECT_CATALOG } from '@/shared/const/subjects.const';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

export const StudentDirectory = () => {
  const { t, plural, subject: subjectName } = useT();
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [result, setResult] = useState<StudentDiscoveryResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void http
      .get<StudentDiscoveryResult>('/students', { params: { search: debouncedSearch || undefined, subject: subject || undefined, limit: 24 } })
      .then((data) => !cancelled && setResult(data))
      .catch(() => !cancelled && setResult({ items: [], total: 0, page: 1, limit: 24 }));
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, subject]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading title={t.students.title} description={t.students.lead} />
      <div className="grid gap-2 sm:grid-cols-3">
        <Label className="relative sm:col-span-2">
          <span className="sr-only">{t.students.searchLabel}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.students.searchPlaceholder}
            className="h-11 pl-9 font-normal"
          />
        </Label>
        <Select value={subject || ANY_FILTER_VALUE} onValueChange={(value) => setSubject(value === ANY_FILTER_VALUE ? '' : value)}>
          <SelectTrigger aria-label={t.discovery.subject}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_FILTER_VALUE}>{t.discovery.allSubjects}</SelectItem>
            {SUBJECT_CATALOG.map((category) => (
              <SelectGroup key={category.label}>
                <SelectLabel>{t.subjectCategories[category.label] ?? category.label}</SelectLabel>
                {category.subjects.map((item) => <SelectItem key={item} value={item}>{subjectName(item)}</SelectItem>)}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
        {result ? plural(t.common.students, result.total) : t.common.loading}
      </p>
      {result && result.items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t.students.empty}
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result?.items.map((student) => <StudentCard key={student.id} student={student} />)}
        </div>
      )}
    </div>
  );
};
