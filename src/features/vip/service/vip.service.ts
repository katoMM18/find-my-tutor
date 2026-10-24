import { userRepository } from '@/features/auth/repository/user.repository';
import { vipRepository } from '@/features/vip/repository/vip.repository';
import { VipSubscriptionDocument } from '@/features/vip/schema/vip-subscription.schema';
import { VipSubscriptionInput } from '@/features/vip/validations/vip.validation';
import { VIP_PLAN_BY_STATUS } from '@/shared/const/vip-plans.const';
import { VIP_STATUS_RANK, type VipStatus } from '@/shared/const/vip.const';
import { dodo } from '@/shared/lib/dodo';
import { ServiceResult } from '@/shared/types/common';

export type ActiveVipStatus = {
  status: VipStatus;
  expiresAt: Date | null;
  rank: number;
};

const getActiveStatus = (subscription: VipSubscriptionDocument | null): ActiveVipStatus => {
  const inactiveBillingStatuses = ['cancelled', 'expired', 'failed'];
  if (
    !subscription ||
    inactiveBillingStatuses.includes(subscription.billingStatus ?? '') ||
    (subscription.expiresAt && subscription.expiresAt <= new Date())
  ) {
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

const getOrCreateProductId = async (status: Exclude<VipStatus, 'none'>): Promise<string> => {
  const existing = await vipRepository.findPlan(status);
  if (existing) return existing.productId;

  const plan = VIP_PLAN_BY_STATUS[status];
  const product = await dodo.client.products.create({
    name: plan.name,
    description: `${plan.name} profile promotion`,
    tax_category: 'saas',
    price: {
      type: 'recurring_price',
      price: plan.price * 100,
      currency: 'USD',
      payment_frequency_count: 1,
      payment_frequency_interval: 'Month',
      subscription_period_count: 20,
      subscription_period_interval: 'Year',
    },
    metadata: { vipStatus: status },
  });

  return (await vipRepository.savePlan(status, product.product_id)).productId;
};

export async function createVipCheckoutService(
  userId: string,
  status: Exclude<VipStatus, 'none'>,
  returnUrl: string
): Promise<ServiceResult<{ checkoutUrl: string }>> {
  const productId = await getOrCreateProductId(status);
  const checkout = await dodo.client.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: returnUrl,
    metadata: { userId, vipStatus: status },
  });

  if (!checkout.checkout_url) return { data: { error: 'CHECKOUT_URL_MISSING' }, status: 502 };
  return { data: { checkoutUrl: checkout.checkout_url }, status: 200 };
}

export async function cancelVipService(userId: string): Promise<ServiceResult<ActiveVipStatus>> {
  const subscription = await vipRepository.findByUserId(userId);
  if (!subscription?.dodoSubscriptionId) return { data: { error: 'SUBSCRIPTION_NOT_FOUND' }, status: 404 };

  const updated = await dodo.client.subscriptions.update(subscription.dodoSubscriptionId, {
    cancel_at_next_billing_date: true,
    cancel_reason: 'cancelled_by_customer',
  });
  await vipRepository.updateByDodoSubscriptionId(subscription.dodoSubscriptionId, {
    cancelAtPeriodEnd: true,
    expiresAt: new Date(updated.next_billing_date),
    billingStatus: updated.status,
  });

  return getVipStatusService(userId);
}

export async function changeVipPlanService(
  userId: string,
  status: Exclude<VipStatus, 'none'>
): Promise<ServiceResult<ActiveVipStatus>> {
  const subscription = await vipRepository.findByUserId(userId);
  if (!subscription?.dodoSubscriptionId) return { data: { error: 'SUBSCRIPTION_NOT_FOUND' }, status: 404 };

  const productId = await getOrCreateProductId(status);
  await dodo.client.subscriptions.changePlan(subscription.dodoSubscriptionId, {
    product_id: productId,
    quantity: 1,
    proration_billing_mode: 'prorated_immediately',
  });
  await vipRepository.updateByDodoSubscriptionId(subscription.dodoSubscriptionId, {
    plan: status,
    status,
    dodoProductId: productId,
    cancelAtPeriodEnd: false,
  });

  return getVipStatusService(userId);
}

type SubscriptionWebhookData = {
  subscription_id?: string;
  product_id?: string;
  status?: string;
  next_billing_date?: string;
  cancel_at_next_billing_date?: boolean;
  metadata?: Record<string, string | number | boolean>;
  customer?: { email?: string | null };
};

const isSubscriptionWebhookData = (data: object): data is SubscriptionWebhookData =>
  'subscription_id' in data || 'product_id' in data || 'next_billing_date' in data;

export async function syncVipWebhookService(event: {
  type: string;
  data: object;
}) {
  if (!isSubscriptionWebhookData(event.data)) return;
  const subscriptionId = event.data.subscription_id;
  if (!subscriptionId) return;

  const existing = await vipRepository.findByDodoSubscriptionId(subscriptionId);
  const metadataStatus = event.data.metadata?.vipStatus;
  const productPlan = event.data.product_id
    ? await vipRepository.findPlanByProductId(event.data.product_id)
    : null;
  const status = typeof metadataStatus === 'string' && metadataStatus in VIP_PLAN_BY_STATUS
    ? metadataStatus as Exclude<VipStatus, 'none'>
    : productPlan?.status ?? existing?.plan;
  const metadataUserId = event.data.metadata?.userId;
  const customer = event.data.customer?.email
    ? await userRepository.findByEmail(event.data.customer.email)
    : null;
  const userId = typeof metadataUserId === 'string' ? metadataUserId : customer?._id.toString();

  if (!existing && typeof userId === 'string' && status) {
    await vipRepository.upsert(userId, {
      status,
      plan: status,
      dodoSubscriptionId: subscriptionId,
      dodoProductId: event.data.product_id,
      billingStatus: event.data.status,
      expiresAt: event.data.next_billing_date ? new Date(event.data.next_billing_date) : undefined,
      cancelAtPeriodEnd: event.data.cancel_at_next_billing_date ?? false,
    });
    return;
  }

  if (existing) {
    const terminal = ['subscription.cancelled', 'subscription.expired', 'subscription.failed'].includes(event.type);
    await vipRepository.updateByDodoSubscriptionId(subscriptionId, {
      status: terminal ? 'none' : status ?? existing.status,
      billingStatus: event.data.status ?? event.type,
      expiresAt: event.data.next_billing_date ? new Date(event.data.next_billing_date) : existing.expiresAt,
      cancelAtPeriodEnd: event.data.cancel_at_next_billing_date ?? existing.cancelAtPeriodEnd,
    });
  }
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
