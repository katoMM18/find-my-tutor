import { cookies, headers } from 'next/headers';

import { LOCALE_COOKIE } from '@/shared/const/i18n.const';
import { i18n } from '@/shared/lib/i18n';

export async function getServerI18n() {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const locale = i18n.resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value, headerList.get('accept-language'));
  return { locale, t: i18n.dictionary(locale) };
}
