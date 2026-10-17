import { describe, expect, it } from 'vitest';

import { isSessionRole } from './session-role';

describe('isSessionRole', () => {
  it('accepts supported roles', () => {
    expect(isSessionRole('teacher')).toBe(true);
    expect(isSessionRole('student')).toBe(true);
  });

  it('rejects missing or invalid roles', () => {
    expect(isSessionRole(undefined)).toBe(false);
    expect(isSessionRole('admin')).toBe(false);
  });
});
