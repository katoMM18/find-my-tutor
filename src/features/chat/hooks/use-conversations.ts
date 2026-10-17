'use client';

import { useCallback, useEffect, useState } from 'react';

import { PublicConversation } from '@/features/chat/types/chat.types';
import { http } from '@/shared/lib/http';

const POLL_MS = 8000;

export const useConversations = () => {
  const [conversations, setConversations] = useState<PublicConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setError(false);
    try {
      setConversations(await http.get<PublicConversation[]>('/conversations'));
    } catch {
      setError(true);
      throw new Error('CONVERSATIONS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void reload().catch(() => undefined), 0);
    const interval = window.setInterval(() => void reload(), POLL_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [reload]);

  return { conversations, loading, error, reload, setConversations };
};
