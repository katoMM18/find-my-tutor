'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ANY_FILTER_VALUE, SUBJECT_CATALOG } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';

type SubjectSelectProps = {
  value: string;
  onChange: (subject: string) => void;
  anyLabel: string;
  className?: string;
};

// Every subject in the catalog, grouped by category. The "any" choice clears the value.
export const SubjectSelect = ({ value, onChange, anyLabel, className }: SubjectSelectProps) => {
  const { t, subject } = useT();

  return (
    <Select value={value || ANY_FILTER_VALUE} onValueChange={(next) => onChange(next === ANY_FILTER_VALUE ? '' : next)}>
      <SelectTrigger aria-label={t.discovery.subject} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY_FILTER_VALUE}>{anyLabel}</SelectItem>
        {SUBJECT_CATALOG.map((category) => (
          <SelectGroup key={category.label}>
            <SelectLabel>{t.subjectCategories[category.label] ?? category.label}</SelectLabel>
            {category.subjects.map((item) => <SelectItem key={item} value={item}>{subject(item)}</SelectItem>)}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};
