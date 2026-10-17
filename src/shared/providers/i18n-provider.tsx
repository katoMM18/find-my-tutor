'use client';

import { createContext, useMemo, type ReactNode } from 'react';
import { z } from 'zod';

import { type Locale } from '@/shared/const/i18n.const';
import { i18n } from '@/shared/lib/i18n';
import { type Dictionary } from '@/shared/types/i18n';

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  locale: Locale;
  children: ReactNode;
};

export const I18nProvider = ({ locale, children }: I18nProviderProps) => {
  const value = useMemo(() => {
    if (typeof window !== 'undefined') z.config(locale === 'ka' ? z.locales.ka() : z.locales.en());
    return { locale, t: i18n.dictionary(locale) };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
