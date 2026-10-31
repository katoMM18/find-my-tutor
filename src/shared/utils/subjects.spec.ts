import { describe, expect, it } from 'vitest';

import { normalizeSubject, normalizeSubjects, paperForSubject } from './subjects';

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
