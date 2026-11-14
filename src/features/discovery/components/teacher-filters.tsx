'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';

import { type TeacherFilterKey, type TeacherFilterValues } from '@/features/discovery/hooks/use-teacher-search';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { LESSON_FORMATS, MAX_PRICE_FILTERS, OTHER_CITIES, TBILISI_DISTRICTS } from '@/shared/const/lesson.const';
import { ANY_FILTER_VALUE, EXPERIENCE_VALUES, RATING_VALUES, SUBJECT_CATALOG } from '@/shared/const/subjects.const';
import { WEEK_DISPLAY_ORDER } from '@/shared/const/week.const';
import { useT } from '@/shared/hooks/use-t';

const fromAny = (value: string) => (value === ANY_FILTER_VALUE ? '' : value);

// Filters that move into the bottom sheet on phones. Search and subject stay on the page.
const SHEET_KEYS = ['day', 'maxPrice', 'format', 'area', 'minExperience', 'minRating'] as const;

type SheetKey = (typeof SHEET_KEYS)[number];

type TeacherFiltersProps = {
  values: TeacherFilterValues;
  onChange: (changes: Partial<Record<TeacherFilterKey, string>>) => void;
  onClear: () => void;
  resultCount: number | null;
};

export const TeacherFilters = ({ values, onChange, onClear, resultCount }: TeacherFiltersProps) => {
  const { t, fmt, plural, subject: subjectName } = useT();
  const [search, setSearch] = useState(values.search);
  const [sheetOpen, setSheetOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const sheetActive = SHEET_KEYS.filter((key) => values[key]).length;

  const changeSearch = (value: string) => {
    setSearch(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange({ search: value.trim() }), 300);
  };

  const fieldLabels: Record<SheetKey, string> = {
    day: t.discovery.day,
    maxPrice: t.lessons.price,
    format: t.lessons.format,
    area: t.lessons.area,
    minExperience: t.discovery.experience,
    minRating: t.discovery.rating,
  };

  const field = (key: SheetKey, className?: string): ReactNode => {
    const select = (options: ReactNode) => (
      <Select value={values[key] || ANY_FILTER_VALUE} onValueChange={(value) => onChange({ [key]: fromAny(value) })}>
        <SelectTrigger aria-label={fieldLabels[key]} className={className}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{options}</SelectContent>
      </Select>
    );

    switch (key) {
      case 'day':
        return select(
          <>
            <SelectItem value={ANY_FILTER_VALUE}>{t.discovery.anyDay}</SelectItem>
            <SelectItem value="today">{t.common.today}</SelectItem>
            {WEEK_DISPLAY_ORDER.map((day) => <SelectItem key={day} value={String(day)}>{t.weekdaysLong[day]}</SelectItem>)}
          </>
        );
      case 'maxPrice':
        return select(
          <>
            <SelectItem value={ANY_FILTER_VALUE}>{t.lessons.anyPrice}</SelectItem>
            {MAX_PRICE_FILTERS.map((price) => <SelectItem key={price} value={price}>{fmt(t.lessons.upTo, { price })}</SelectItem>)}
          </>
        );
      case 'format':
        return select(
          <>
            <SelectItem value={ANY_FILTER_VALUE}>{t.lessons.anyFormat}</SelectItem>
            {LESSON_FORMATS.map((format) => <SelectItem key={format} value={format}>{t.lessons.formats[format]}</SelectItem>)}
          </>
        );
      case 'area':
        return select(
          <>
            <SelectItem value={ANY_FILTER_VALUE}>{t.lessons.anyArea}</SelectItem>
            <SelectGroup>
              <SelectLabel>{t.lessons.tbilisi}</SelectLabel>
              {TBILISI_DISTRICTS.map((area) => <SelectItem key={area} value={area}>{t.lessons.areas[area]}</SelectItem>)}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>{t.lessons.otherCities}</SelectLabel>
              {OTHER_CITIES.map((area) => <SelectItem key={area} value={area}>{t.lessons.areas[area]}</SelectItem>)}
            </SelectGroup>
          </>
        );
      case 'minExperience':
        return select(
          <>
            <SelectItem value={ANY_FILTER_VALUE}>{t.experienceOptions.any}</SelectItem>
            {EXPERIENCE_VALUES.map((value) => (
              <SelectItem key={value} value={String(value)}>{fmt(t.experienceOptions.years, { count: value })}</SelectItem>
            ))}
          </>
        );
      case 'minRating':
        return select(
          <>
            <SelectItem value={ANY_FILTER_VALUE}>{t.ratingOptions.any}</SelectItem>
            {RATING_VALUES.map((value) => (
              <SelectItem key={value} value={String(value)}>{fmt(t.ratingOptions.stars, { count: value })}</SelectItem>
            ))}
          </>
        );
    }
  };

  return (
    <section aria-label={t.discovery.filtersLabel} className="grid grid-cols-2 gap-2 lg:grid-cols-12">
      <Label className="relative col-span-2 lg:col-span-3">
        <span className="sr-only">{t.discovery.searchLabel}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink" aria-hidden="true" />
        <Input
          type="search"
          value={search}
          onChange={(event) => changeSearch(event.target.value)}
          placeholder={t.discovery.searchPlaceholder}
          className="h-11 pl-9 font-normal"
        />
      </Label>
      <Select value={values.subject || ANY_FILTER_VALUE} onValueChange={(value) => onChange({ subject: fromAny(value) })}>
        <SelectTrigger aria-label={t.discovery.subject} className="lg:col-span-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY_FILTER_VALUE}>{t.discovery.allSubjects}</SelectItem>
          {SUBJECT_CATALOG.map((category) => (
            <SelectGroup key={category.label}>
              <SelectLabel>{t.subjectCategories[category.label] ?? category.label}</SelectLabel>
              {category.subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subjectName(subject)}</SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
        className="h-11 justify-start lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {t.discovery.filtersButton}
        {sheetActive > 0 && (
          <span className="ml-auto inline-flex size-5 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground tabular-nums">
            {sheetActive}
          </span>
        )}
      </Button>

      <div className="hidden lg:col-span-3 lg:block">{field('day')}</div>
      <div className="hidden lg:col-span-3 lg:block">{field('maxPrice')}</div>
      <div className="hidden lg:col-span-3 lg:block">{field('format')}</div>
      <div className="hidden lg:col-span-3 lg:block">{field('area')}</div>
      <div className="hidden lg:col-span-3 lg:block">{field('minExperience')}</div>
      <div className="hidden lg:col-span-3 lg:block">{field('minRating')}</div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" closeLabel={t.common.close} className="max-h-svh lg:hidden">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">{t.discovery.filtersButton}</SheetTitle>
            <SheetDescription>{t.discovery.filtersSheetLead}</SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 gap-4 overflow-y-auto px-5 py-3">
            {SHEET_KEYS.map((key) => (
              <div key={key} className="space-y-1.5">
                <p className="text-sm font-semibold text-muted-foreground">{fieldLabels[key]}</p>
                {field(key, 'h-12 w-full')}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-rule p-4">
            <Button type="button" variant="ghost" size="lg" onClick={onClear} disabled={sheetActive === 0}>
              {t.common.clear}
            </Button>
            <Button type="button" size="lg" className="flex-1" onClick={() => setSheetOpen(false)}>
              {resultCount === null ? t.discovery.showResults : fmt(t.discovery.showCount, { count: plural(t.common.tutors, resultCount) })}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};
