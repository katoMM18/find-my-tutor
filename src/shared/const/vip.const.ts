export const VIP_STATUSES = ['none', 'vip', 'vip_plus', 'super_vip'] as const;

export type VipStatus = (typeof VIP_STATUSES)[number];

export const VIP_STATUS_LABELS: Record<VipStatus, string> = {
  none: '',
  vip: 'VIP',
  vip_plus: 'VIP+',
  super_vip: 'SUPER VIP',
};

export const VIP_STATUS_RANK: Record<VipStatus, number> = {
  none: 0,
  vip: 1,
  vip_plus: 2,
  super_vip: 3,
};
