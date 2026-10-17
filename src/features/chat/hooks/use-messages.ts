'use client';

import { useCallback, useEffect, useState } from 'react';

import { PublicMessage } from '@/features/chat/types/chat.types';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

const POLL_MS = 4000;
const PAGE_LIMIT = 100;

export const useMessages = (conversationId: string | null, onActivity: () => void) => {
  const { t } = useT();
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    const result = await http.get<{ items: PublicMessage[]; total: number }>(
      `/conversations/${id}/messages`,
      { params: { limit: PAGE_LIMIT, page: 1 } }
    );
    setMessages(result.items);
    await http.post(`/conversations/${id}/read`);
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    const initial = window.setTimeout(() => {
      setLoading(true);
      setMessages([]);
      void load(conversationId)
        .then(onActivity)
        .catch(() => setError(t.chat.loadError))
        .finally(() => setLoading(false));
    }, 0);
    const interval = window.setInterval(() => void load(conversationId).catch(() => undefined), POLL_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [conversationId, load, onActivity, t.chat.loadError]);

  const send = async (body: string) => {
    if (!conversationId || !body.trim()) return false;
    setError(null);
    try {
      const message = await http.post<PublicMessage>(`/conversations/${conversationId}/messages`, { body: body.trim() });
      setMessages((current) => [...current, message]);
      onActivity();
      return true;
    } catch {
      setError(t.chat.sendError);
      return false;
    }
  };

  return { messages, loading, error, send };
};
