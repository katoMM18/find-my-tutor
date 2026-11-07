'use client';
import { useCallback, useEffect, useState } from 'react';

import { PendingVerification } from '@/features/verification/types/verification.types';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

export const useAdminVerifications = () => {
  const { t } = useT();
  const [items, setItems] = useState<PendingVerification[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    void http.get<PendingVerification[]>('/admin/verifications').then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  const decide = async (id: string, decision: 'approve' | 'reject', reason = '') => {
    setBusyId(id);
    setError(null);
    try {
      await http.patch(`/admin/verifications/${id}`, { decision, reason });
      setItems((current) => current?.filter((item) => item.id !== id) ?? null);
    } catch {
      setError(t.verification.adminFailed);
    } finally {
      setBusyId(null);
    }
  };

  return { items, busyId, error, decide };
};
