'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PublicConversation } from '@/features/chat/types/chat.types';
import { http } from '@/shared/lib/http';

export const useStartConversation = () => {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (participantId: string, firstMessage?: string) => {
    setSending(true);
    setError(null);
    try {
      const conversation = await http.post<PublicConversation>('/conversations', { participantId });
      if (firstMessage?.trim()) {
        await http.post(`/conversations/${conversation.id}/messages`, { body: firstMessage.trim() });
      }
      router.push(`/messages?c=${conversation.id}`);
      return true;
    } catch {
      setError('START_FAILED');
      setSending(false);
      return false;
    }
  };

  return { start, sending, error };
};
