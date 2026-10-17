'use client';

import { Search, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { type TeacherFilterKey, type TeacherFilterValues } from '@/features/discovery/hooks/use-teacher-search';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { NativeSelect } from '@/shared/components/ui/native-select';
import { EXPERIENCE_VALUES, RATING_VALUES, SUBJECT_CATALOG } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';

type TeacherFiltersProps = {
  values: TeacherFilterValues;
  activeCount: number;
  onChange: (changes: Partial<Record<TeacherFilterKey, string>>) => void;
  onClear: () => void;
};

export const TeacherFilters = ({ values, activeCount, onChange, onClear }: TeacherFiltersProps) => {
  const { t, fmt, subject: subjectName } = useT();
  const [search, setSearch] = useState(values.search);
  const timer = useRef<number | undefined>(undefined);

  const changeSearch = (value: string) => {
    setSearch(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange({ search: value.trim() }), 300);
  };

  return (
    <section aria-label={t.discovery.filtersLabel} className="grid grid-cols-2 gap-2 lg:grid-cols-12">
      <label className="relative col-span-2 lg:col-span-4">
        <span className="sr-only">{t.discovery.searchLabel}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={search}
          onChange={(event) => changeSearch(event.target.value)}
          placeholder={t.discovery.searchPlaceholder}
          className="h-10 pl-9"
        />
      </label>
      <label className="col-span-2 lg:col-span-3">
        <span className="sr-only">{t.discovery.subject}</span>
        <NativeSelect value={values.subject} onChange={(event) => onChange({ subject: event.target.value })} className="h-10">
          <option value="">{t.discovery.allSubjects}</option>
          {SUBJECT_CATALOG.map((category) => (
            <optgroup key={category.label} label={t.subjectCategories[category.label] ?? category.label}>
              {category.subjects.map((subject) => (
                <option key={subject} value={subject}>{subjectName(subject)}</option>
              ))}
            </optgroup>
          ))}
        </NativeSelect>
      </label>
      <label className="lg:col-span-2">
        <span className="sr-only">{t.discovery.experience}</span>
        <NativeSelect value={values.minExperience} onChange={(event) => onChange({ minExperience: event.target.value })} className="h-10">
          <option value="">{t.experienceOptions.any}</option>
          {EXPERIENCE_VALUES.map((value) => <option key={value} value={value}>{fmt(t.experienceOptions.years, { count: value })}</option>)}
        </NativeSelect>
      </label>
      <label className="lg:col-span-2">
        <span className="sr-only">{t.discovery.rating}</span>
        <NativeSelect value={values.minRating} onChange={(event) => onChange({ minRating: event.target.value })} className="h-10">
          <option value="">{t.ratingOptions.any}</option>
          {RATING_VALUES.map((value) => <option key={value} value={value}>{fmt(t.ratingOptions.stars, { count: value })}</option>)}
        </NativeSelect>
      </label>
      {activeCount > 0 && (
        <div className="col-span-2 flex items-center lg:col-span-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              window.clearTimeout(timer.current);
              setSearch('');
              onClear();
            }}
            className="text-muted-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            Clear
          </Button>
        </div>
      )}
    </section>
  );
};
