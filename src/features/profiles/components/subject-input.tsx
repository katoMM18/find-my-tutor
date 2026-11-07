'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Toggle } from '@/shared/components/ui/toggle';
import { SUBJECT_CATALOG, ALL_SUBJECTS, SECOND_LANGUAGE_OPTIONS, SECOND_LANGUAGE_SUBJECT } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';
import { secondLanguageOf, toSecondLanguageSubject } from '@/shared/utils/subjects';

type SubjectInputProps = {
  subjects: string[];
  onChange: (subjects: string[]) => void;
  max?: number;
};

export const SubjectInput = ({ subjects, onChange, max = 20 }: SubjectInputProps) => {
  const { t, subject: subjectName } = useT();
  const secondLanguage = subjects.map(secondLanguageOf).find(Boolean) ?? null;
  // The chip is "on" while the language is being picked, before anything is saved.
  const [pickingLanguage, setPickingLanguage] = useState(false);
  const secondLanguageOn = pickingLanguage || secondLanguage !== null;
  const legacy = subjects.filter((subject) => !ALL_SUBJECTS.includes(subject) && !secondLanguageOf(subject));
  const withoutSecondLanguage = subjects.filter((subject) => !secondLanguageOf(subject));

  const toggle = (subject: string) => {
    if (subjects.includes(subject)) onChange(subjects.filter((item) => item !== subject));
    else if (subjects.length < max) onChange([...subjects, subject]);
  };

  const toggleSecondLanguage = (on: boolean) => {
    setPickingLanguage(on);
    if (!on) onChange(withoutSecondLanguage);
  };

  const chooseSecondLanguage = (language: string) => {
    if (!secondLanguage && subjects.length >= max) return;
    onChange([...withoutSecondLanguage, toSecondLanguageSubject(language)]);
  };

  const chip = (subject: string) => {
    if (subject === SECOND_LANGUAGE_SUBJECT) {
      return (
        <Toggle key={subject} variant="outline" size="sm" pressed={secondLanguageOn} onPressedChange={toggleSecondLanguage}>
          {secondLanguageOn && <Check className="size-3.5" aria-hidden="true" />}
          {t.subjects.SecondLanguage}
        </Toggle>
      );
    }
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
          {category.subjects.includes(SECOND_LANGUAGE_SUBJECT) && secondLanguageOn && (
            <div className="mt-3 max-w-xs space-y-2">
              <Label htmlFor="second-language">{t.profileEditor.secondLanguagePick}</Label>
              <Select value={secondLanguage ?? ''} onValueChange={chooseSecondLanguage}>
                <SelectTrigger id="second-language">
                  <SelectValue placeholder={t.profileEditor.secondLanguagePick} />
                </SelectTrigger>
                <SelectContent>
                  {SECOND_LANGUAGE_OPTIONS.map((language) => (
                    <SelectItem key={language} value={language}>{t.languages[language] ?? language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
