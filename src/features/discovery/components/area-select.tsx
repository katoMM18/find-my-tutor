'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { type LessonArea, OTHER_CITIES, TBILISI_DISTRICTS } from '@/shared/const/lesson.const';
import { ANY_FILTER_VALUE } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';
import { isLessonArea } from '@/shared/utils/lesson';

type AreaSelectProps = {
  value: LessonArea | null;
  onChange: (area: LessonArea | null) => void;
  anyLabel: string;
  className?: string;
};

// Tbilisi districts first, then other cities, with an "any" choice on top.
export const AreaSelect = ({ value, onChange, anyLabel, className }: AreaSelectProps) => {
  const { t } = useT();

  return (
    <Select value={value ?? ANY_FILTER_VALUE} onValueChange={(next) => onChange(isLessonArea(next) ? next : null)}>
      <SelectTrigger aria-label={t.lessons.area} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY_FILTER_VALUE}>{anyLabel}</SelectItem>
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
  );
};
