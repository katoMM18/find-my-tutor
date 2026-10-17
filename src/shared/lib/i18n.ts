import { EN_DICTIONARY } from '@/shared/const/dictionary-en.const';
import { KA_DICTIONARY } from '@/shared/const/dictionary-ka.const';
import { DEFAULT_LOCALE, INTL_LOCALES, LOCALES, type Locale } from '@/shared/const/i18n.const';
import { type Dictionary, type PluralForms, type TemplateValues } from '@/shared/types/i18n';

const DICTIONARIES: Record<Locale, Dictionary> = {
  en: EN_DICTIONARY,
  ka: KA_DICTIONARY,
};

class I18n {
  isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
  }

  resolveLocale(cookieValue?: string | null, acceptLanguage?: string | null): Locale {
    if (this.isLocale(cookieValue)) return cookieValue;
    const preferred = acceptLanguage
      ?.split(',')
      .map((part) => part.split(';')[0]?.trim().slice(0, 2).toLowerCase())
      .find((code) => this.isLocale(code));
    return this.isLocale(preferred) ? preferred : DEFAULT_LOCALE;
  }

  dictionary(locale: Locale): Dictionary {
    return DICTIONARIES[locale];
  }

  intlLocale(locale: Locale): string {
    return INTL_LOCALES[locale];
  }

  format(template: string, values: TemplateValues = {}): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
      key in values ? String(values[key]) : match
    );
  }

  formatDate(date: Date | string, locale: Locale): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const month = this.dictionary(locale).monthsShort[d.getMonth()];
    return locale === 'en' ? `${month} ${d.getDate()}, ${d.getFullYear()}` : `${d.getDate()} ${month}, ${d.getFullYear()}`;
  }

  formatDateTime(date: Date | string, locale: Locale): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${this.formatDate(d, locale)} ${time}`;
  }

  formatRelative(date: Date | string, locale: Locale, now = new Date()): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const labels = this.dictionary(locale).time;
    const minutes = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (minutes < 1) return labels.now;
    if (minutes < 60) return this.format(labels.minutes, { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return this.format(labels.hours, { count: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return this.format(labels.days, { count: days });
    return this.formatDate(d, locale);
  }

  plural(forms: PluralForms, count: number, values: TemplateValues = {}): string {
    return this.format(count === 1 ? forms.one : forms.other, { count, ...values });
  }
}

export const i18n = new I18n();
