import { z } from 'zod';

import { LESSON_AREAS, LESSON_FORMATS, PRICE_MAX_GEL, PRICE_MIN_GEL } from '@/shared/const/lesson.const';
import { REQUEST_GOALS } from '@/shared/const/requests.const';

// "Match me" answers. Empty choices are null so the form and the API share one shape.
export const MatchSchema = z.object({
  subject: z.string().min(1).max(100),
  goal: z.enum(REQUEST_GOALS),
  budget: z.number().int().min(PRICE_MIN_GEL).max(PRICE_MAX_GEL).nullable(),
  format: z.enum(LESSON_FORMATS).nullable(),
  area: z.enum(LESSON_AREAS).nullable(),
  days: z.array(z.number().int().min(0).max(6)).max(7),
});

export type MatchType = z.infer<typeof MatchSchema>;

export const PriceGuideQuerySchema = z.object({
  subject: z.string().min(1).max(100),
  area: z.enum(LESSON_AREAS).optional(),
});

export type PriceGuideQueryType = z.infer<typeof PriceGuideQuerySchema>;
