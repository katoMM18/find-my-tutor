import { vipRepository } from '@/features/vip/repository/vip.repository';
import { VipSubscriptionDocument } from '@/features/vip/schema/vip-subscription.schema';
import { VipSubscriptionInput } from '@/features/vip/validations/vip.validation';
import { VIP_STATUS_RANK, type VipStatus } from '@/shared/const/vip.const';
import { ServiceResult } from '@/shared/types/common';

export type ActiveVipStatus = {
  status: VipStatus;
  expiresAt: Date | null;
  rank: number;
};

const getActiveStatus = (subscription: VipSubscriptionDocument | null): ActiveVipStatus => {
  if (!subscription || (subscription.expiresAt && subscription.expiresAt <= new Date())) {
    return { status: 'none', expiresAt: null, rank: 0 };
  }

  const status = subscription.status as VipStatus;
  return {
    status,
    expiresAt: subscription.expiresAt ?? null,
    rank: VIP_STATUS_RANK[status],
  };
};

export async function getVipStatusService(userId: string): Promise<ServiceResult<ActiveVipStatus>> {
  return { data: getActiveStatus(await vipRepository.findByUserId(userId)), status: 200 };
}

export async function activateVipService(
  userId: string,
  input: VipSubscriptionInput
): Promise<ServiceResult<ActiveVipStatus>> {
  if (input.status !== 'none' && (!input.expiresAt || input.expiresAt <= new Date())) {
    return { data: { error: 'EXPIRATION_REQUIRED' }, status: 400 };
  }

  const subscription = await vipRepository.upsert(userId, input);
  return { data: getActiveStatus(subscription), status: 200 };
}
