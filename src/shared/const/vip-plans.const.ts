import { type VipStatus } from '@/shared/const/vip.const';

export type VipPlan = {
  status: Exclude<VipStatus, 'none'>;
  name: string;
  price: number;
};

export const VIP_PLANS: VipPlan[] = [
  { status: 'vip', name: 'VIP', price: 5 },
  { status: 'vip_plus', name: 'VIP+', price: 10 },
  { status: 'super_vip', name: 'Super VIP', price: 15 },
];

export const VIP_PLAN_BY_STATUS = Object.fromEntries(
  VIP_PLANS.map((plan) => [plan.status, plan])
) as Record<Exclude<VipStatus, 'none'>, VipPlan>;
