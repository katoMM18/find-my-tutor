import { describe, expect, it } from 'vitest';

import { safeRedirect } from './safe-redirect';

describe('safeRedirect', () => {
  it('keeps same-origin paths', () => {
    expect(safeRedirect('/teachers/123')).toBe('/teachers/123');
  });

  it('falls back for external or protocol-relative urls', () => {
    expect(safeRedirect('https://evil.test')).toBe('/dashboard');
    expect(safeRedirect('//evil.test')).toBe('/dashboard');
    expect(safeRedirect(null, '/profile')).toBe('/profile');
  });
});
