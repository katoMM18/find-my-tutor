import DodoPayments from 'dodopayments';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const subscriptions = vi.hoisted(() => ({ update: vi.fn(), changePlan: vi.fn() }));

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
      isScheduledCancellation: actual.dodo.isScheduledCancellation,
      get client() {
        return { subscriptions };
      },
    },
  };
});

import { vipRepository } from '@/features/vip/repository/vip.repository';

import { cancelVipService, changeVipPlanService } from './vip.service';

const mockRepo = vi.mocked(vipRepository);
const USER_ID = '507f1f77bcf86cd799439011';
const scheduledCancellation = () =>
  new DodoPayments.ConflictError(
    409,
    { code: 'PLAN_CHANGE_NOT_ALLOWED_FOR_SCHEDULED_CANCELLATION', message: 'Subscription scheduled for cancellation' },
    'Subscription scheduled for cancellation',
    new Headers()
  );

describe('cancelVipService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when the user has no subscription', async () => {
    mockRepo.findByUserId.mockResolvedValueOnce(null);
    const result = await cancelVipService(USER_ID);
    expect(result.status).toBe(404);
  });

  it('turns a rejected payment key into a coded 503 instead of throwing', async () => {
    mockRepo.findByUserId.mockResolvedValueOnce({ dodoSubscriptionId: 'sub_1' } as never);
    subscriptions.update.mockRejectedValueOnce(new DodoPayments.AuthenticationError(401, undefined, 'Unauthorized', new Headers()));
    const result = await cancelVipService(USER_ID);
    expect(result).toEqual({ data: { error: 'PAYMENTS_UNAUTHORIZED' }, status: 503 });
    expect(mockRepo.updateByDodoSubscriptionId).not.toHaveBeenCalled();
  });
});

describe('changeVipPlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.findPlan.mockResolvedValue({ productId: 'prod_vip_plus' } as never);
  });

  it('resumes a subscription that is set to cancel before changing the plan', async () => {
    mockRepo.findByUserId.mockResolvedValue({ dodoSubscriptionId: 'sub_1', cancelAtPeriodEnd: true } as never);
    await changeVipPlanService(USER_ID, 'vip_plus');
    expect(subscriptions.update).toHaveBeenCalledWith('sub_1', { cancel_at_next_billing_date: false });
    expect(subscriptions.update.mock.invocationCallOrder[0]).toBeLessThan(subscriptions.changePlan.mock.invocationCallOrder[0]);
    expect(mockRepo.updateByDodoSubscriptionId).toHaveBeenCalledWith('sub_1', expect.objectContaining({ status: 'vip_plus', cancelAtPeriodEnd: false }));
  });

  it('resumes and retries once when Dodo reports a cancellation our record missed', async () => {
    mockRepo.findByUserId.mockResolvedValue({ dodoSubscriptionId: 'sub_1', cancelAtPeriodEnd: false } as never);
    subscriptions.changePlan.mockRejectedValueOnce(scheduledCancellation()).mockResolvedValueOnce({});
    await changeVipPlanService(USER_ID, 'vip_plus');
    expect(subscriptions.update).toHaveBeenCalledWith('sub_1', { cancel_at_next_billing_date: false });
    expect(subscriptions.changePlan).toHaveBeenCalledTimes(2);
  });

  it('keeps the current plan by only undoing the scheduled cancellation', async () => {
    mockRepo.findByUserId.mockResolvedValue({ dodoSubscriptionId: 'sub_1', status: 'vip', cancelAtPeriodEnd: true } as never);
    await changeVipPlanService(USER_ID, 'vip');
    expect(subscriptions.update).toHaveBeenCalledWith('sub_1', { cancel_at_next_billing_date: false });
    expect(subscriptions.changePlan).not.toHaveBeenCalled();
    expect(mockRepo.updateByDodoSubscriptionId).toHaveBeenCalledWith('sub_1', { cancelAtPeriodEnd: false });
  });
});
