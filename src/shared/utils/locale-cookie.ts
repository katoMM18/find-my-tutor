import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from '@/shared/const/i18n.const';

export function writeLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
