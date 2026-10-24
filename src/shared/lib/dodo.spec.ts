import { describe, expect, it } from 'vitest';

import { dodo } from '@/shared/lib/dodo';

describe('dodo client', () => {
  it('exports a configured client wrapper', () => {
    expect(dodo).toBeDefined();
  });
});
