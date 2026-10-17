import { describe, expect, it } from 'vitest';

import { normalizeSubject, normalizeSubjects } from './subjects';

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
