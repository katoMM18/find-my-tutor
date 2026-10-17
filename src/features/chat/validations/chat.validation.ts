import { z } from 'zod';

export const CreateConversationSchema = z.object({
  participantId: z.string().min(24).max(24),
});

export const SendMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
