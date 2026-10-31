import DodoPayments from 'dodopayments';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/vip/repository/vip.repository', () => ({
  vipRepository: {
    findByUserId: vi.fn(),
    findPlan: vi.fn(),
    updateByDodoSubscriptionId: vi.fn(),
  },
}));

vi.mock('@/shared/lib/dodo', async () => {
  const actual = await vi.importActual<typeof import('@/shared/lib/dodo')>('@/shared/lib/dodo');
  return {
    dodo: {
      errorCode: actual.dodo.errorCode,
      get client() {
        return { subscriptions: { update: vi.fn().mockRejectedValue(new DodoPayments.AuthenticationError(401, undefined, 'Unauthorized', new Headers())) } };
      },
    },
  };
});

import { vipRepository } from '@/features/vip/repository/vip.repository';

import { cancelVipService } from './vip.service';

const mockRepo = vi.mocked(vipRepository);

describe('cancelVipService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when the user has no subscription', async () => {
    mockRepo.findByUserId.mockResolvedValueOnce(null);
    const result = await cancelVipService('507f1f77bcf86cd799439011');
    expect(result.status).toBe(404);
  });

  it('turns a rejected payment key into a coded 503 instead of throwing', async () => {
    mockRepo.findByUserId.mockResolvedValueOnce({ dodoSubscriptionId: 'sub_1' } as never);
    const result = await cancelVipService('507f1f77bcf86cd799439011');
    expect(result).toEqual({ data: { error: 'PAYMENTS_UNAUTHORIZED' }, status: 503 });
    expect(mockRepo.updateByDodoSubscriptionId).not.toHaveBeenCalled();
  });
});
