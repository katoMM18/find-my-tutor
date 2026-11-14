import { describe, expect, it } from 'vitest';

import {
  humanizeSubjectKey,
  normalizeSubject,
  normalizeSubjects,
  paperForSubject,
  secondLanguageOf,
  subjectFilterValue,
  toSecondLanguageSubject,
} from './subjects';

describe('subject normalisation', () => {
  it('maps casing, spacing and aliases onto the catalog', () => {
    expect(normalizeSubject('english')).toBe('English');
    expect(normalizeSubject('SoftwareEngineering')).toBe('Software Engineering');
    expect(normalizeSubject('math')).toBe('Mathematics');
  });

  it('keeps unknown subjects and removes duplicates', () => {
    expect(normalizeSubjects(['history', 'History', 'hitosty'])).toEqual(['History', 'hitosty']);
  });
});

describe('paperForSubject', () => {
  it('maps a subject to its group paper', () => {
    expect(paperForSubject('Mathematics')).toBe('bg-paper-lemon');
    expect(paperForSubject('SoftwareEngineering')).toBe('bg-paper-peach');
  });

  it('falls back to white paper', () => {
    expect(paperForSubject(undefined)).toBe('bg-paper-white');
    expect(paperForSubject('Pottery')).toBe('bg-paper-white');
  });
});

describe('second foreign language subjects', () => {
  it('stores the language inside the subject and reads it back', () => {
    expect(toSecondLanguageSubject('German')).toBe('SecondLanguage:German');
    expect(secondLanguageOf('SecondLanguage:German')).toBe('German');
    expect(secondLanguageOf('German')).toBeNull();
  });

  it('keeps second-language subjects through normalisation', () => {
    expect(normalizeSubject('SecondLanguage:Italian')).toBe('SecondLanguage:Italian');
  });

  it('filters the whole group, and prints it on language paper', () => {
    const filter = subjectFilterValue('SecondLanguage');
    expect(filter instanceof RegExp && filter.test('SecondLanguage:French')).toBe(true);
    expect(subjectFilterValue('Art')).toBe('Art');
    expect(paperForSubject('SecondLanguage:French')).toBe('bg-paper-pink');
  });
});

describe('humanizeSubjectKey', () => {
  it('splits catalog keys into words', () => {
    expect(humanizeSubjectKey('SoftwareEngineering')).toBe('Software Engineering');
    expect(humanizeSubjectKey('web_design')).toBe('web design');
  });
});
