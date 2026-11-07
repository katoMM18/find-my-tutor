import { z } from 'zod';

export const CreateRatingRequestSchema = z.object({
  teacherProfileId: z.string().min(24).max(24),
});

export const SubmitRatingSchema = z.object({
  value: z.number().int().min(1).max(5),
  comment: z.string().max(2000),
  result: z.string().trim().max(120).default(''),
});

export type CreateRatingRequestInput = z.infer<typeof CreateRatingRequestSchema>;
export type SubmitRatingInput = z.infer<typeof SubmitRatingSchema>;
