export const LOCALES = ['en', 'ka'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE = 'locale';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ka: 'ქართული',
};

export const LOCALE_SHORT_NAMES: Record<Locale, string> = {
  en: 'EN',
  ka: 'ქა',
};

export const INTL_LOCALES: Record<Locale, string> = {
  en: 'en-US',
  ka: 'ka-GE',
};
