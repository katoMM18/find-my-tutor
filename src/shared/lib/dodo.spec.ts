import DodoPayments from 'dodopayments';
import { afterEach, describe, expect, it } from 'vitest';

import { dodo } from '@/shared/lib/dodo';

describe('dodo client', () => {
  const original = process.env.DODO_PAYMENTS_API_KEY;
  afterEach(() => {
    process.env.DODO_PAYMENTS_API_KEY = original;
  });

  it('rejects a missing API key', () => {
    delete process.env.DODO_PAYMENTS_API_KEY;
    expect(() => dodo.client).toThrow('DODO_PAYMENTS_API_KEY is not configured');
  });

  it('rejects a webhook secret placed in the API key slot', () => {
    process.env.DODO_PAYMENTS_API_KEY = 'whsec_example';
    expect(() => dodo.client).toThrow(/webhook secret/);
  });

  it('maps configuration, auth and other failures to codes', () => {
    expect(dodo.errorCode(new Error('DODO_PAYMENTS_API_KEY is not configured'))).toBe('PAYMENTS_NOT_CONFIGURED');
    expect(dodo.errorCode(new DodoPayments.AuthenticationError(401, undefined, 'Unauthorized', new Headers()))).toBe('PAYMENTS_UNAUTHORIZED');
    expect(dodo.errorCode(new Error('network'))).toBe('PAYMENTS_UNAVAILABLE');
  });
});
