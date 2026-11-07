'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';

import { type TeacherFilterKey, type TeacherFilterValues } from '@/features/discovery/hooks/use-teacher-search';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { LESSON_FORMATS, MAX_PRICE_FILTERS, OTHER_CITIES, TBILISI_DISTRICTS } from '@/shared/const/lesson.const';
import { ANY_FILTER_VALUE, EXPERIENCE_VALUES, RATING_VALUES, SUBJECT_CATALOG } from '@/shared/const/subjects.const';
import { WEEK_DISPLAY_ORDER } from '@/shared/const/week.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

const fromAny = (value: string) => (value === ANY_FILTER_VALUE ? '' : value);

type TeacherFiltersProps = {
  values: TeacherFilterValues;
  onChange: (changes: Partial<Record<TeacherFilterKey, string>>) => void;
};

export const TeacherFilters = ({ values, onChange }: TeacherFiltersProps) => {
  const { t, fmt, subject: subjectName } = useT();
  const [search, setSearch] = useState(values.search);
  const [showMore, setShowMore] = useState(Boolean(values.minExperience || values.minRating || values.format || values.area));
  const timer = useRef<number | undefined>(undefined);

  const changeSearch = (value: string) => {
    setSearch(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange({ search: value.trim() }), 300);
  };

  return (
    <section aria-label={t.discovery.filtersLabel} className="grid grid-cols-2 gap-2 lg:grid-cols-12">
      <Label className="relative col-span-2 lg:col-span-4">
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
      <Select value={values.day || ANY_FILTER_VALUE} onValueChange={(value) => onChange({ day: fromAny(value) })}>
        <SelectTrigger aria-label={t.discovery.day} className="lg:col-span-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY_FILTER_VALUE}>{t.discovery.anyDay}</SelectItem>
          <SelectItem value="today">{t.common.today}</SelectItem>
          {WEEK_DISPLAY_ORDER.map((day) => <SelectItem key={day} value={String(day)}>{t.weekdaysLong[day]}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={values.maxPrice || ANY_FILTER_VALUE} onValueChange={(value) => onChange({ maxPrice: fromAny(value) })}>
        <SelectTrigger aria-label={t.lessons.price} className="lg:col-span-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY_FILTER_VALUE}>{t.lessons.anyPrice}</SelectItem>
          {MAX_PRICE_FILTERS.map((price) => <SelectItem key={price} value={price}>{fmt(t.lessons.upTo, { price })}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowMore((open) => !open)}
        aria-expanded={showMore}
        className="col-span-2 h-11 justify-start lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {showMore ? t.discovery.fewerFilters : t.discovery.moreFilters}
      </Button>
      <div className={cn('lg:col-span-3 lg:block', !showMore && 'hidden')}>
        <Select value={values.format || ANY_FILTER_VALUE} onValueChange={(value) => onChange({ format: fromAny(value) })}>
          <SelectTrigger aria-label={t.lessons.format}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_FILTER_VALUE}>{t.lessons.anyFormat}</SelectItem>
            {LESSON_FORMATS.map((format) => <SelectItem key={format} value={format}>{t.lessons.formats[format]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className={cn('lg:col-span-3 lg:block', !showMore && 'hidden')}>
        <Select value={values.area || ANY_FILTER_VALUE} onValueChange={(value) => onChange({ area: fromAny(value) })}>
          <SelectTrigger aria-label={t.lessons.area}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_FILTER_VALUE}>{t.lessons.anyArea}</SelectItem>
            <SelectGroup>
              <SelectLabel>{t.lessons.tbilisi}</SelectLabel>
              {TBILISI_DISTRICTS.map((area) => <SelectItem key={area} value={area}>{t.lessons.areas[area]}</SelectItem>)}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>{t.lessons.otherCities}</SelectLabel>
              {OTHER_CITIES.map((area) => <SelectItem key={area} value={area}>{t.lessons.areas[area]}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className={cn('lg:col-span-3 lg:block', !showMore && 'hidden')}>
        <Select value={values.minExperience || ANY_FILTER_VALUE} onValueChange={(value) => onChange({ minExperience: fromAny(value) })}>
          <SelectTrigger aria-label={t.discovery.experience}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_FILTER_VALUE}>{t.experienceOptions.any}</SelectItem>
            {EXPERIENCE_VALUES.map((value) => (
              <SelectItem key={value} value={String(value)}>{fmt(t.experienceOptions.years, { count: value })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={cn('lg:col-span-3 lg:block', !showMore && 'hidden')}>
        <Select value={values.minRating || ANY_FILTER_VALUE} onValueChange={(value) => onChange({ minRating: fromAny(value) })}>
          <SelectTrigger aria-label={t.discovery.rating}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_FILTER_VALUE}>{t.ratingOptions.any}</SelectItem>
            {RATING_VALUES.map((value) => (
              <SelectItem key={value} value={String(value)}>{fmt(t.ratingOptions.stars, { count: value })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
};
