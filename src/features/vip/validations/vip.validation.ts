import { z } from 'zod';

import { VIP_STATUSES } from '@/shared/const/vip.const';

export const VipSubscriptionSchema = z.object({
  status: z.enum(VIP_STATUSES),
  expiresAt: z.coerce.date().optional(),
});

export type VipSubscriptionInput = z.infer<typeof VipSubscriptionSchema>;
