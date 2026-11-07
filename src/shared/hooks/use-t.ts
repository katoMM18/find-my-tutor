'use client';

import { useContext } from 'react';

import { DEFAULT_LOCALE } from '@/shared/const/i18n.const';
import { i18n } from '@/shared/lib/i18n';
import { I18nContext } from '@/shared/providers/i18n-provider';
import { type PluralForms, type TemplateValues } from '@/shared/types/i18n';
import { secondLanguageOf } from '@/shared/utils/subjects';

// Subjects saved as catalog keys (e.g. "SoftwareEngineering") read as words when no translation exists.
const humanizeKey = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();

export const useT = () => {
  const context = useContext(I18nContext);
  const locale = context?.locale ?? DEFAULT_LOCALE;
  const t = context?.t ?? i18n.dictionary(DEFAULT_LOCALE);

  return {
    t,
    locale,
    intl: i18n.intlLocale(locale),
    fmt: (template: string, values?: TemplateValues) => i18n.format(template, values),
    plural: (forms: PluralForms, count: number, values?: TemplateValues) => i18n.plural(forms, count, values),
    subject: (name: string) => {
      const language = secondLanguageOf(name);
      if (language) return `${t.subjects.SecondLanguage ?? 'Second foreign language'} (${t.languages[language] ?? language})`;
      return t.subjects[name] ?? humanizeKey(name);
    },
    date: (value: Date | string) => i18n.formatDate(value, locale),
    dateTime: (value: Date | string) => i18n.formatDateTime(value, locale),
    relative: (value: Date | string) => i18n.formatRelative(value, locale),
  };
};
