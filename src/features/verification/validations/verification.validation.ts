import { z } from 'zod';

export const VerificationDecisionSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    reason: z.string().trim().max(500).default(''),
  })
  .refine((data) => data.decision === 'approve' || data.reason.length > 0, { path: ['reason'], message: 'REASON_REQUIRED' });

export type VerificationDecisionType = z.infer<typeof VerificationDecisionSchema>;
