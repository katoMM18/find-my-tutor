import { describe, expect, it } from 'vitest';

import { EN_DICTIONARY } from '@/shared/const/dictionary-en.const';
import { KA_DICTIONARY } from '@/shared/const/dictionary-ka.const';

import { i18n } from './i18n';

const collectKeys = (value: unknown, prefix = ''): string[] => {
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => collectKeys(child, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
};

describe('i18n', () => {
  it('prefers the cookie, then Accept-Language, then English', () => {
    expect(i18n.resolveLocale('ka', 'en-US')).toBe('ka');
    expect(i18n.resolveLocale(undefined, 'ka-GE,ka;q=0.9,en;q=0.8')).toBe('ka');
    expect(i18n.resolveLocale('fr', 'de-DE')).toBe('en');
  });

  it('fills placeholders and leaves unknown ones intact', () => {
    expect(i18n.format('Hi {name}, {missing}', { name: 'Ana' })).toBe('Hi Ana, {missing}');
  });

  it('picks plural forms', () => {
    expect(i18n.plural(EN_DICTIONARY.common.reviews, 1)).toBe('1 review');
    expect(i18n.plural(EN_DICTIONARY.common.reviews, 3)).toBe('3 reviews');
  });

  it('keeps Georgian in sync with English, except the subject name map', () => {
    const omitSubjects = (keys: string[]) => keys.filter((key) => !key.startsWith('subjects.'));
    expect(omitSubjects(collectKeys(KA_DICTIONARY))).toEqual(omitSubjects(collectKeys(EN_DICTIONARY)));
  });

  it('formats dates without relying on browser Intl locale data', () => {
    const date = new Date(2026, 9, 10, 9, 5);
    expect(i18n.formatDate(date, 'en')).toBe('Oct 10, 2026');
    expect(i18n.formatDate(date, 'ka')).toBe('10 ოქტ, 2026');
    expect(i18n.formatDateTime(date, 'ka')).toBe('10 ოქტ, 2026 09:05');
    expect(i18n.formatRelative(new Date(2026, 9, 10, 9, 0), 'ka', date)).toBe('5 წთ წინ');
    expect(i18n.formatRelative(new Date(2026, 9, 10, 9, 0), 'en', date)).toBe('5m ago');
  });
});
