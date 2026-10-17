import { z } from 'zod';

export const MediaUploadSchema = z.object({
  kind: z.enum(['profile_image', 'qualification']),
  publicId: z.string().min(1).max(300).regex(/^[a-zA-Z0-9_-]+$/),
  mimeType: z.string().min(1).max(100),
  bytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type MediaUploadInput = z.infer<typeof MediaUploadSchema>;
