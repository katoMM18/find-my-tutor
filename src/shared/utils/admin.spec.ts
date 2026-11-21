import { describe, expect, it } from 'vitest';

import { hasRole, isAdminAccount, isAdminSession } from './admin';

describe('roles', () => {
  it('finds a role in the user document', () => {
    expect(hasRole(['admin'], 'admin')).toBe(true);
    expect(hasRole([], 'admin')).toBe(false);
    expect(hasRole(undefined, 'admin')).toBe(false);
  });

  it('treats the admin role or the legacy admin extra role as admin', () => {
    expect(isAdminAccount('admin', [])).toBe(true);
    expect(isAdminAccount('teacher', ['admin'])).toBe(true);
    expect(isAdminAccount('student', [])).toBe(false);
    expect(isAdminAccount(undefined, undefined)).toBe(false);
  });

  it('only treats an explicit admin flag on the session as admin', () => {
    expect(isAdminSession({ isAdmin: true })).toBe(true);
    expect(isAdminSession({ isAdmin: false })).toBe(false);
    expect(isAdminSession({})).toBe(false);
    expect(isAdminSession(null)).toBe(false);
  });
});
