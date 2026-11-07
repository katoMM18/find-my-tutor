'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { PublicRequest, TutorRequest } from '@/features/requests/types/request.types';
import { RequestFormType } from '@/features/requests/validations/request.validation';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

export const useRequests = <T extends PublicRequest | TutorRequest>() => {
  const router = useRouter();
  const { t } = useT();
  const [items, setItems] = useState<T[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    void http.get<T[]>('/requests').then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  const create = async (form: RequestFormType) => {
    setError(null);
    try {
      await http.post('/requests', {
        subject: form.subject,
        goal: form.goal,
        format: form.format || undefined,
        area: form.area || undefined,
        budget: form.budget ?? undefined,
        note: form.note,
      });
      load();
      return true;
    } catch {
      setError(t.requests.error);
      return false;
    }
  };

  const close = async (id: string) => {
    setBusyId(id);
    try {
      await http.patch(`/requests/${id}`);
      load();
    } catch {
      setError(t.requests.error);
    } finally {
      setBusyId(null);
    }
  };

  const reply = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const { conversationId } = await http.post<{ conversationId: string }>(`/requests/${id}/reply`);
      router.push(`/messages?c=${conversationId}`);
    } catch {
      setError(t.requests.error);
      setBusyId(null);
    }
  };

  return { items, busyId, error, create, close, reply };
};
