'use client';

import { useCallback, useEffect, useState } from 'react';

import { RatingRequestView } from '@/features/ratings/types/rating.types';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

export const useRatingRequests = (enabled = true) => {
  const { t } = useT();
  const toMessage = (error: unknown) => {
    const code = error instanceof Error ? error.message : '';
    return t.reviews.errors[code] ?? t.common.genericError;
  };
  const [requests, setRequests] = useState<RatingRequestView[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setRequests(await http.get<RatingRequestView[]>('/ratings/requests'));
    } catch {
      setError(t.common.genericError);
    } finally {
      setLoading(false);
    }
  }, [t.common.genericError]);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [enabled, reload]);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      await reload();
      return true;
    } catch (requestError) {
      setError(toMessage(requestError));
      return false;
    }
  };

  return {
    requests,
    loading,
    error,
    reload,
    requestReview: (teacherProfileId: string) => run(() => http.post('/ratings/requests', { teacherProfileId })),
    approve: (id: string) => run(() => http.post(`/ratings/requests/${id}/approve`)),
    submit: (id: string, value: number, comment: string) =>
      run(() => http.post(`/ratings/requests/${id}/submit`, { value, comment })),
  };
};
