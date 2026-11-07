import { z } from 'zod';

import { LESSON_AREAS, LESSON_FORMATS, PRICE_MAX_GEL } from '@/shared/const/lesson.const';
import { REQUEST_GOALS } from '@/shared/const/requests.const';

export const CreateRequestSchema = z.object({
  subject: z.string().min(1).max(100),
  goal: z.enum(REQUEST_GOALS),
  format: z.enum(LESSON_FORMATS).optional(),
  area: z.enum(LESSON_AREAS).optional(),
  budget: z.number().int().min(1).max(PRICE_MAX_GEL).optional(),
  note: z.string().trim().max(1000).default(''),
});

export type CreateRequestType = z.infer<typeof CreateRequestSchema>;

// Client form: every field present; optional selects use '' for "not set".
export const RequestFormSchema = z.object({
  subject: z.string().min(1).max(100),
  goal: z.enum(REQUEST_GOALS),
  format: z.union([z.enum(LESSON_FORMATS), z.literal('')]),
  area: z.union([z.enum(LESSON_AREAS), z.literal('')]),
  budget: z.number().int().min(1).max(PRICE_MAX_GEL).nullable(),
  note: z.string().max(1000),
});

export type RequestFormType = z.infer<typeof RequestFormSchema>;
