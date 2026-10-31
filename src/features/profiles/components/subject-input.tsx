'use client';

import { Check } from 'lucide-react';

import { Toggle } from '@/shared/components/ui/toggle';
import { SUBJECT_CATALOG, ALL_SUBJECTS } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';

type SubjectInputProps = {
  subjects: string[];
  onChange: (subjects: string[]) => void;
  max?: number;
};

export const SubjectInput = ({ subjects, onChange, max = 20 }: SubjectInputProps) => {
  const { t, subject: subjectName } = useT();
  const legacy = subjects.filter((subject) => !ALL_SUBJECTS.includes(subject));
  const toggle = (subject: string) => {
    if (subjects.includes(subject)) onChange(subjects.filter((item) => item !== subject));
    else if (subjects.length < max) onChange([...subjects, subject]);
  };

  const chip = (subject: string) => {
    const selected = subjects.includes(subject);
    return (
      <Toggle key={subject} variant="outline" size="sm" pressed={selected} onPressedChange={() => toggle(subject)}>
        {selected && <Check className="size-3.5" aria-hidden="true" />}
        {subjectName(subject)}
      </Toggle>
    );
  };

  return (
    <div className="space-y-4">
      {SUBJECT_CATALOG.map((category) => (
        <fieldset key={category.label}>
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            {t.subjectCategories[category.label] ?? category.label}
          </legend>
          <div className="flex flex-wrap gap-2">{category.subjects.map(chip)}</div>
        </fieldset>
      ))}
      {legacy.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">{t.profileEditor.otherSubjects}</legend>
          <div className="flex flex-wrap gap-2">{legacy.map(chip)}</div>
        </fieldset>
      )}
    </div>
  );
};
